// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { ProductService } from '../../services/product.service';
// import { Product } from '../../models/product.model';

// @Component({
//   selector: 'app-product-list',
//   standalone: true,
//   imports: [CommonModule, RouterModule],
//   templateUrl: './product-list.component.html',
//   styleUrls: ['./product-list.component.css']
// })
// export class ProductListComponent implements OnInit {
//   products: Product[] = [];
//   loading = true;
//   error: string | null = null;

//   constructor(private productService: ProductService) {}

//   ngOnInit(): void {
//     this.loadProducts();
//   }

//   loadProducts(): void {
//     this.loading = true;
//     this.productService.getProducts().subscribe({
//       next: (data) => {
//         this.products = data;
//         this.loading = false;
//       },
//       error: (err) => {
//         this.error = 'Failed to load products. Please try again later.';
//         this.loading = false;
//         console.error('Error loading products:', err);
//       }
//     });
//   }
// }

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { Observable } from 'rxjs';
import { CartService } from '../../services/cart.service';

type TabId = 'all' | 'new' | 'featured' | 'top';

interface Tab {
  id: TabId;
  label: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  activeTab: TabId = 'all';

  tabs: Tab[] = [
    { id: 'all', label: 'All Products' },
    { id: 'new', label: 'New Arrivals' },
    { id: 'featured', label: 'Featured' },
    { id: 'top', label: 'Top Selling' },
  ];

  products: Product[] = [];
  products$!: Observable<Product[]>;

  wowDelays = ['0.1s', '0.3s', '0.5s', '0.7s'];

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadTab('all');
  }

  loadTab(tab: TabId): void {
    this.activeTab = tab;
    this.products$ = this.productService.getByTab(tab);

    this.products$.subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (err) => {
        console.error('Failed to load products', err);
      }
    });
  }

  getDelay(index: number): string {
    return this.wowDelays[index % this.wowDelays.length];
  }

  onAddToCart(product: Product): void {
    this.cartService.addToCart(product.id.toString(), 1).subscribe({
      next: () => console.log('Added to cart:', product.name),
      error: (err) => console.error('Failed to add to cart', err),
    });
  }

  onAddToWishlist(product: Product): void {
    console.log('❤️ Wishlist:', product.name);
  }

  onCompare(product: Product): void {
    console.log('🔀 Compare:', product.name);
  }

  onQuickView(product: Product): void {
    console.log('👁️ Quick view:', product.name);
  }
}