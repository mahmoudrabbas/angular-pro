import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { CartItem } from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.scss'],
})
export class Cart implements OnInit {
  constructor(
    public cartService: CartService,
    private confirmDialog: ConfirmDialogService,
  ) { }

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

  async removeItem(item: CartItem): Promise<void> {
    const confirmed = await this.confirmDialog.open(
      'Remove Item',
      `Are you sure you want to remove "${item.product.name}" from your cart?`,
    );
    if (confirmed) {
      this.cartService.removeItem(item.product._id).subscribe();
    }
  }

  async clearCart(): Promise<void> {
    const confirmed = await this.confirmDialog.open(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart? This action cannot be undone.',
    );
    if (confirmed) {
      this.cartService.clearCart().subscribe();
    }
  }

  getProductImage(item: CartItem): string {
    if (item.product?.images?.length) {
      const img = item.product.images[0];
      // Handle both {url: "..."} objects and plain string URLs
      return typeof img === 'string' ? img : (img as any).url || 'assets/img/product-3.png';
    }
    return 'assets/img/product-3.png';
  }
}
