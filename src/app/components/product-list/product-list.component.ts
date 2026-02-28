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
// import { ServicesComponent } from '../services/services.component';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service'; // Fix import

type TabId = 'all' | 'new' | 'featured' | 'top';

interface Tab {
  id: TabId;
  label: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent], // Add ServicesComponent here
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

  // wow delays cycle: 0.1s, 0.3s, 0.5s, 0.7s
  wowDelays = ['0.1s', '0.3s', '0.5s', '0.7s'];

  // Fix constructor - inject ProductService, not ServicesComponent
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadTab('all');
  }

  loadTab(tab: TabId): void {
    this.activeTab = tab;
    this.products = this.productService.getByTab(tab); // Use productService
  }

  getDelay(index: number): string {
    return this.wowDelays[index % this.wowDelays.length];
  }

  onAddToCart(product: Product): void {
    console.log('🛒 Add to cart:', product.name);
    // wire up cart service here
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
