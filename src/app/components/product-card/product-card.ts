import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  @Input() wowDelay: string = '0.1s';
  @Input() isInWishlist: boolean = false;
  @Input() wishlistEntryId: string = '';

  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();
  @Output() compare = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();
  @Output() removed = new EventEmitter<string>(); // emits productId

  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);

  wishlistLoading = signal(false);
  wishlistAdded = signal(false);
  entryId = signal<string | null>(null);

  cartLoading = signal(false);
  cartAdded = signal(false);

  ngOnInit() {
    // ── debug ──────────────────────────────────────────
    console.log('[ProductCard] product.id     =', this.product.id);
    console.log('[ProductCard] isInWishlist   =', this.isInWishlist);
    console.log('[ProductCard] wishlistEntryId=', this.wishlistEntryId);
    // ──────────────────────────────────────────────────

    if (this.isInWishlist) {
      this.wishlistAdded.set(true);
      this.entryId.set(this.wishlistEntryId || null);
    }
  }

  get stars(): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < this.product.rating);
  }

  toggleWishlist() {
    if (this.wishlistLoading()) return;

    console.log('[toggleWishlist] added=', this.wishlistAdded(), '| entryId=', this.entryId());

    this.wishlistAdded() ? this.removeFromWishlist() : this.addToWishlistFn();
    // this.isInWishlist = !this.isInWishlist;
  }

  private addToWishlistFn() {
    this.wishlistLoading.set(true);

    this.wishlistService.addItem(this.product.id.toString()).subscribe({
      next: (res) => {
        console.log('[addItem] response=', res);

        const products = res.wishlist?.products ?? [];
        const match = [...products]
          .reverse()
          .find(
            (p: any) =>
              p.product === this.product.id.toString() ||
              p.product?._id === this.product.id.toString(),
          );

        // console.log('[addItem] matched entry=', match);

        this.isInWishlist = true;
        this.entryId.set(match?._id ?? null);
        this.wishlistAdded.set(true);
        this.wishlistLoading.set(false);
        this.addToWishlist.emit(this.product);
      },
      error: (err) => {
        console.error('[addItem] error=', err);
        this.wishlistLoading.set(false);
      },
    });
  }

  private removeFromWishlist() {
    this.wishlistLoading.set(true);
    this.doRemove(this.product.id.toString());
  }

  private doRemove(productId: string) {
    this.wishlistService.removeItem(productId).subscribe({
      next: (res) => {
        this.wishlistAdded.set(false);
        this.entryId.set(null);
        this.wishlistLoading.set(false);
        this.removed.emit(this.product.id.toString());
        this.isInWishlist = false;
      },
      error: (err) => {
        console.error('[doRemove] error=', err);
        this.wishlistLoading.set(false);
      },
    });
  }

  onAddToCart() {
    if (this.cartLoading()) return;
    this.cartLoading.set(true);

    this.cartService.addToCart(this.product.id.toString(), 1).subscribe({
      next: () => {
        this.cartLoading.set(false);
        this.cartAdded.set(true);
        this.addToCart.emit(this.product);
        setTimeout(() => this.cartAdded.set(false), 2000);
      },
      error: () => this.cartLoading.set(false),
    });
  }
}
