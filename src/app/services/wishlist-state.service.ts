import { Injectable, signal, computed } from '@angular/core';
import { WishlistService } from './wishlist.service';

@Injectable({ providedIn: 'root' })
export class WishlistStateService {
  private productIds = signal<Set<string>>(new Set());

  constructor(private wishlistService: WishlistService) {
    this.load();
  }

  load() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        if (res.success && res.wishlist?.products) {
          const ids = new Set<string>(
            res.wishlist.products
              .filter((e) => e.product !== null)
              .map((e) => (typeof e.product === 'string' ? e.product : (e.product as any)?._id))
              .filter(Boolean),
          );
          this.productIds.set(ids);
        }
      },
      error: () => {},
    });
  }

  isInWishlist(productId: string): boolean {
    return this.productIds().has(productId);
  }

  add(productId: string) {
    this.productIds.update((set) => new Set([...set, productId]));
  }

  remove(productId: string) {
    this.productIds.update((set) => {
      const next = new Set(set);
      next.delete(productId);
      return next;
    });
  }

  clear() {
    this.productIds.set(new Set());
  }
}
