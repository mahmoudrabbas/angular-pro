import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { SearchService, SearchProduct } from '../../services/search.service';
import { VisualSearchService, Product } from '../../services/visual-search.service';
import { WishlistStateService } from '../../services/wishlist-state.service';
import { TranslationService } from '../../services/translation.service';
import { CategoryService } from '../../services/category.service';

// import { NavigationEnd } from '@angular/router';
// import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  providers: [VisualSearchService],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoading = true;
  isCurrencyDropdownOpen = false;
  isLanguageDropdownOpen = false;
  isDashboardDropdownOpen = false;
  isAllCategoriesOpen = false;
  isPagesDropdownOpen = false;
  isMobileCategoriesOpen = false;
  isMobileMenuOpen = false;

  // ── Smart Search ──────────────────────────────────────────────────────────
  searchQuery = '';
  selectedCategory = 'All Category';
  suggestions: SearchProduct[] = [];
  isSuggestOpen = false;
  isSuggestLoading = false;
  activeSuggestion = -1; // keyboard nav index

  selectedCurrency = 'USD';
  selectedLanguage = 'English';

  categories: string[] = ['All Category'];
  currencies = ['USD', 'EGP', 'SAR'];
  languages = ['English', 'Arabic'];

  sidebarCategories = [
    { name: 'Accessories', count: 3 },
    { name: 'Electronics & Computer', count: 5 },
    { name: 'Laptops & Desktops', count: 2 },
    { name: 'Mobiles & Tablets', count: 8 },
    { name: 'SmartPhone & Smart TV', count: 5 },
  ];

  // ── Visual Search ─────────────────────────────────────────────────────────
  isVisualSearchOpen = false;
  vsSelectedFile: File | null = null;
  vsPreviewUrl: string | null = null;
  vsIsLoading = false;
  vsIsDragging = false;
  vsResults: Product[] = [];
  vsError = '';
  vsSearchTimeMs = 0;
  vsSearchDone = false;

  private searchInput$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    public wishlistState: WishlistStateService,
    public authService: AuthService,
    public cartService: CartService,
    private searchService: SearchService,
    private visualSearchService: VisualSearchService,
    private categoryService: CategoryService,
    private router: Router,
    private elRef: ElementRef,
    public translationService: TranslationService,
  ) {}

  ngOnInit() {
    setTimeout(() => (this.isLoading = false), 500);
    this.cartService.loadCart();
    this.wishlistState.load();

    this.categoryService.getAll().pipe(takeUntil(this.destroy$)).subscribe((cats) => {
      this.categories = ['All Category', ...cats.map((c) => c.name)];
    });

    // Listen for language change events
    window.addEventListener('languageChange', this.handleLanguageChange.bind(this));

    // Set initial language from service
    const currentLang = this.translationService.getCurrentLanguage();
    this.selectedLanguage = currentLang === 'ar' ? 'Arabic' : 'English';

    // this.router.events
    //   .pipe(
    //     filter((e) => e instanceof NavigationEnd),
    //     takeUntil(this.destroy$),
    //   )
    //   .subscribe(() => {
    //     const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    //     if (token) {
    //       this.wishlistState.load();
    //     }
    //   });

    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          if (q.trim().length < 2) {
            this.suggestions = [];
            this.isSuggestOpen = false;
            return of(null);
          }
          this.isSuggestLoading = true;
          return this.searchService.getSuggestions(q).pipe(catchError(() => of(null)));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((res: any) => {
        this.isSuggestLoading = false;
        if (res?.products) {
          this.suggestions = res.products;
          this.isSuggestOpen = this.suggestions.length > 0;
          this.activeSuggestion = -1;
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.vsPreviewUrl) URL.revokeObjectURL(this.vsPreviewUrl);
  }

  // Called on every keystroke in the search input
  onSearchInput(): void {
    this.searchInput$.next(this.searchQuery);
  }

  // Keyboard navigation: ArrowUp/Down to browse, Enter to select or search, Escape to close
  onSearchKeydown(event: KeyboardEvent): void {
    if (!this.isSuggestOpen) {
      if (event.key === 'Enter') this.onSearch();
      return;
    }
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeSuggestion = Math.min(this.activeSuggestion + 1, this.suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeSuggestion = Math.max(this.activeSuggestion - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        this.activeSuggestion >= 0
          ? this.selectSuggestion(this.suggestions[this.activeSuggestion])
          : this.onSearch();
        break;
      case 'Escape':
        this.closeSuggestions();
        break;
    }
  }

  // Clicking a suggestion goes directly to product detail
  selectSuggestion(product: SearchProduct): void {
    this.searchQuery = product.name;
    this.isSuggestOpen = false;
    this.router.navigate(['/product', product._id]);
  }

  // Main search → /search results page
  onSearch(): void {
    const q = this.searchQuery.trim();
    if (!q && this.selectedCategory === 'All Category') return;
    this.closeSuggestions();
    this.router.navigate(['/search'], {
      queryParams: {
        q: q || null,
        category: this.selectedCategory !== 'All Category' ? this.selectedCategory : null,
      },
    });
  }

  closeSuggestions(): void {
    this.isSuggestOpen = false;
    this.activeSuggestion = -1;
  }

  // Close suggestions when clicking outside the navbar component
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.closeSuggestions();
    }
  }

  toggleDropdown(dropdown: string) {
    this.isCurrencyDropdownOpen = dropdown === 'currency' ? !this.isCurrencyDropdownOpen : false;
    this.isLanguageDropdownOpen = dropdown === 'language' ? !this.isLanguageDropdownOpen : false;
    this.isDashboardDropdownOpen = dropdown === 'dashboard' ? !this.isDashboardDropdownOpen : false;
  }

  toggleAllCategories() {
    this.isAllCategoriesOpen = !this.isAllCategoriesOpen;
  }
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    this.authService.signout();
    this.isDashboardDropdownOpen = false;
  }

  switchLanguage(language: string): void {
    this.translationService.setLanguage(language === 'English' ? 'en' : 'ar');
    this.selectedLanguage = language;
    this.isLanguageDropdownOpen = false;
  }

  private handleLanguageChange(event: any): void {
    const newLanguage = event.detail.language;
    this.selectedLanguage = newLanguage === 'ar' ? 'Arabic' : 'English';
  }

  // ── Visual Search ─────────────────────────────────────────────────────────

  openVisualSearch(): void {
    this.isVisualSearchOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeVisualSearch(): void {
    this.isVisualSearchOpen = false;
    document.body.style.overflow = '';
  }

  vsOnFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.vsHandleFile(file);
  }

  vsDragEnter(e: DragEvent): void {
    e.preventDefault();
    this.vsIsDragging = true;
  }
  vsDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.vsIsDragging = false;
  }

  vsDrop(e: DragEvent): void {
    e.preventDefault();
    this.vsIsDragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.vsHandleFile(file);
  }

  private vsHandleFile(file: File): void {
    const validation = this.visualSearchService.validateFile(file);
    if (!validation.valid) {
      this.vsError = validation.error!;
      return;
    }
    if (this.vsPreviewUrl) URL.revokeObjectURL(this.vsPreviewUrl);
    this.vsSelectedFile = file;
    this.vsPreviewUrl = URL.createObjectURL(file);
    this.vsResults = [];
    this.vsError = '';
    this.vsSearchDone = false;
  }

  vsSearch(): void {
    if (!this.vsSelectedFile) return;
    this.vsIsLoading = true;
    this.vsError = '';
    this.vsResults = [];
    this.vsSearchDone = false;

    this.visualSearchService
      .search(this.vsSelectedFile, { limit: 8, minScore: 0.75 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.vsResults = res.products;
          this.vsSearchTimeMs = res.searchTimeMs;
          this.vsIsLoading = false;
          this.vsSearchDone = true;
        },
        error: (err) => {
          this.vsError = err.message ?? 'Something went wrong';
          this.vsIsLoading = false;
          this.vsSearchDone = true;
        },
      });
  }

  vsGoToProduct(id: string): void {
    this.closeVisualSearch();
    this.router.navigate(['/product', id]);
  }
}
