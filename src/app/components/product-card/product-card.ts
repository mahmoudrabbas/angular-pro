import { Component, Input, Output, EventEmitter, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { RouterLink } from '@angular/router';
import { WishlistStateService } from '../../services/wishlist-state.service'; // ← CHANGE
import { CartService } from '../../services/cart.service';
import { CompareService } from '../../services/compare.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.scss'],
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;
  @Input() wowDelay: string = '0.1s';
  @Input() isInWishlist: boolean = false;
  @Input() wishlistEntryId: string = '';

  @Output() addToCart = new EventEmitter<Product>();
  @Output() addToWishlist = new EventEmitter<Product>();
  @Output() quickView = new EventEmitter<Product>();
  @Output() removed = new EventEmitter<string>();

  private wishlistState = inject(WishlistStateService); // ← CHANGE
  private cartService = inject(CartService);

  wishlistLoading = signal(false);
  wishlistAdded = signal(false);
  entryId = signal<string | null>(null);

  cartLoading = signal(false);
  cartAdded = signal(false);

  ngOnInit() {
    if (this.isInWishlist) {
      this.wishlistAdded.set(true);
      this.entryId.set(this.wishlistEntryId || null);
    }
  }

  compareMessage = '';
  private messageTimer: any;

  constructor(public compareService: CompareService) {}

  get stars(): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < this.product.rating);
  }

  toggleWishlist() {
    if (this.wishlistLoading()) return;
    this.wishlistAdded() ? this.removeFromWishlist() : this.addToWishlistFn();
  }

  private addToWishlistFn() {
    this.wishlistLoading.set(true);

    this.wishlistState.addItem(this.product.id.toString()).subscribe({
      // ← CHANGE
      next: (res) => {
        const products = res.wishlist?.products ?? [];
        const match = [...products]
          .reverse()
          .find(
            (p: any) =>
              p.product === this.product.id.toString() ||
              p.product?._id === this.product.id.toString(),
          );

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

    this.wishlistState.removeItem(this.product.id.toString()).subscribe({
      // ← CHANGE
      next: () => {
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

    const rawPrice = this.p.price ?? this.p.newPrice;
    const price =
      typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) : rawPrice || 0;

    const meta = {
      name: this.product.name,
      price,
      image: this.p.image || this.p.images?.[0]?.url || 'assets/img/product-3.png',
    };

    this.cartService.addToCart(this.product.id.toString(), 1, meta).subscribe({
      next: () => {
        this.cartLoading.set(false);
        this.cartAdded.set(true);
        this.addToCart.emit(this.product);
        setTimeout(() => this.cartAdded.set(false), 2000);
      },
      error: () => this.cartLoading.set(false),
    });
  }

  private get p(): any {
    return this.product as any;
  }

  get productId(): string {
    return String(this.p._id || this.p.id || '');
  }
  get isInCompare(): boolean {
    return this.compareService.isAdded(this.productId);
  }
  get compareDisabled(): boolean {
    return this.compareService.isFull() && !this.isInCompare;
  }

  onCompare(): void {
    if (this.compareDisabled) return;
    const rawPrice = this.p.price ?? this.p.newPrice;
    const price =
      typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) : rawPrice || 0;

    const result = this.compareService.toggle({
      _id: this.productId,
      name: this.product.name,
      price,
      image: this.p.image || this.p.images?.[0]?.url || null,
      shortDescription: this.p.shortDescription,
      description: this.p.description,
      ratings: this.p.ratings,
      inventory: this.p.inventory,
      category: this.p.category,
      isFeatured: this.p.isFeatured,
      soldCount: this.p.soldCount,
    });

    this.compareMessage = result.message;
    clearTimeout(this.messageTimer);
    this.messageTimer = setTimeout(() => (this.compareMessage = ''), 2500);
  }
}
