// import { Component, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-product-card',
//   imports: [CommonModule],
//   templateUrl: './product-card.html',
//   styleUrl: './product-card.scss',
// })
// export class ProductCard {
//   @Input() product: any;
//   @Input() imageUrl: string = '';
//   @Input() name: string = '';
//   @Input() price: number = 0;
//   @Input() category: string = '';
//   @Input() rating: number = 0;

//   addToCart() {
//     console.log('Added to cart:', this.name);
//   }

//   viewDetails() {
//     console.log('View details for:', this.name);
//   }
// }

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.html',
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() wowDelay: string = '0.1s';
  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();
  @Output() compare = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();

  get stars(): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < this.product.rating);
  }
}
