import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class Cart implements OnInit {
  constructor(public cartService: CartService) { }

  ngOnInit(): void {
    this.cartService.loadCart();
  }

  get cartItems(): CartItem[] {
    return this.cartService.cart()?.items ?? [];
  }

  get subtotal(): number {
    return this.cartService.cartTotal();
  }

  get shipping(): number {
    return this.subtotal > 50 ? 0 : 10;
  }

  get total(): number {
    return this.subtotal + this.shipping;
  }

  get loading(): boolean {
    return this.cartService.loading();
  }

  get error(): string | null {
    return this.cartService.error();
  }

  increaseQuantity(item: CartItem): void {
    this.cartService
      .updateQuantity(item.product._id, item.quantity + 1)
      .subscribe();
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService
        .updateQuantity(item.product._id, item.quantity - 1)
        .subscribe();
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.product._id).subscribe();
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe();
  }

  getProductImage(item: CartItem): string {
    return item.product?.images?.length
      ? item.product.images[0]
      : 'assets/img/product-3.png';
  }
}
