import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { CartService } from '../../services/cart.service';
import { CompareService } from '../../services/compare.service';
import { CategoryService } from '../../services/category.service';
import { ProductCardComponent } from '../product-card/product-card';
import { CompareBar } from '../compare-bar/compare-bar';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent, CompareBar],
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.scss'],
})
export class SearchResults implements OnInit, OnDestroy {
  query = '';
  category = 'All Category';
  products: Product[] = [];
  isLoading = false;
  searchMethod = '';
  total = 0;
  page = 1;
  pages = 1;
  minPrice: number | null = null;
  maxPrice: number | null = null;

  sortOptions = [
    { label: 'Most Relevant', value: 'relevant' },
    { label: 'Price: Low → High', value: 'price_asc' },
    { label: 'Price: High → Low', value: 'price_desc' },
    { label: 'Top Rated', value: 'rating' },
  ];
  sortBy = 'relevant';

  categories: string[] = ['All Category'];

  wowDelays = ['0.1s', '0.3s', '0.5s', '0.7s'];

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private searchService: SearchService,
    private cartService: CartService,
    public compareService: CompareService,
    private categoryService: CategoryService,
  ) {}

  ngOnInit() {
    this.categoryService.getAll().pipe(takeUntil(this.destroy$)).subscribe((cats) => {
      this.categories = ['All Category', ...cats.map((c) => c.name)];
    });

    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.query = params['q'] || '';
      this.category = params['category'] || 'All Category';
      this.page = parseInt(params['page'] || '1');
      this.runSearch();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  runSearch() {
    this.isLoading = true;
    this.searchService
      .search(this.query, {
        category: this.category,
        minPrice: this.minPrice ?? undefined,
        maxPrice: this.maxPrice ?? undefined,
        page: this.page,
        limit: 12,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const mapped = (res.products || []).map((p: any) => this.mapToProduct(p));
          this.products = this.sortProducts(mapped);
          this.total = res.total;
          this.pages = res.pages;
          this.searchMethod = res.searchMethod;
          this.isLoading = false;
        },
        error: () => {
          this.products = [];
          this.isLoading = false;
        },
      });
  }

  // Mirrors ProductService.mapApiToProduct — converts raw API shape → Product model
  private mapToProduct(p: any): Product {
    let image = 'assets/img/product-1.png';
    if (p.images?.length > 0) {
      image = p.images[0]?.url || p.images[0] || image;
    }
    const price = p.price || 0;
    const compareAtPrice = p.compareAtPrice || price;

    return {
      id: p._id || p.id,
      image,
      category: p.category?.name || p.shortDescription || 'Electronics',
      name: p.name || 'Unknown Product',
      oldPrice: `$${compareAtPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      newPrice: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      rating: p.ratings?.average ? Math.round(p.ratings.average) : 4,
      badge: p.isFeatured ? 'New' : null,
      tab: ['all'],
      // Raw fields kept so CompareService gets full product data
      _id: p._id,
      price: p.price,
      shortDescription: p.shortDescription,
      description: p.description,
      ratings: p.ratings,
      inventory: p.inventory,
      isFeatured: p.isFeatured,
      soldCount: p.soldCount,
    } as any;
  }

  sortProducts(products: Product[]): Product[] {
    const raw = products as any[];
    switch (this.sortBy) {
      case 'price_asc':
        return [...raw].sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc':
        return [...raw].sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'rating':
        return [...raw].sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
      default:
        return products;
    }
  }

  getDelay(index: number): string {
    return this.wowDelays[index % this.wowDelays.length];
  }

  onSortChange() {
    this.products = this.sortProducts(this.products);
  }
  applyFilters() {
    this.page = 1;
    this.updateUrlAndSearch();
  }
  clearFilters() {
    this.minPrice = null;
    this.maxPrice = null;
    this.category = 'All Category';
    this.page = 1;
    this.updateUrlAndSearch();
  }

  updateUrlAndSearch() {
    this.router.navigate([], {
      queryParams: {
        q: this.query || null,
        category: this.category !== 'All Category' ? this.category : null,
        page: this.page > 1 ? this.page : null
      },
      queryParamsHandling: 'merge'
    });
  }

  goToPage(p: number) {
    if (p < 1 || p > this.pages) return;
    this.page = p;
    this.router.navigate([], {
      queryParams: { q: this.query, page: p },
      queryParamsHandling: 'merge',
    });
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.pages }, (_, i) => i + 1);
  }

  getMethodLabel(): string {
    return this.searchMethod === 'vector'
      ? '⚡ AI Semantic'
      : this.searchMethod === 'hybrid'
        ? '⚡ AI + Keyword'
        : '🔤 Keyword';
  }

  onAddToCart(product: Product): void {
    console.log('Added to cart:', product.name);
  }

  onAddToWishlist(product: Product): void {
    console.log('❤️ Wishlist:', product.name);
  }

  onQuickView(product: Product): void {
    console.log('👁️ Quick view:', product.name);
  }
  tabs: { id: string; label: string }[] = [];
  activeTab = '';
  loadTab(tabId: string): void {
    this.activeTab = tabId;
  }
}
