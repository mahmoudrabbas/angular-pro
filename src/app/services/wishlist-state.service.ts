import { Injectable, signal, computed } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { WishlistService, WishlistActionResponse } from './wishlist.service';

@Injectable({ providedIn: 'root' })
export class WishlistStateService {
  private productIds = signal<Set<string>>(new Set());

  wishlistCount = computed(() => this.productIds().size);

  constructor(private wishlistService: WishlistService) {}

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

  addItem(productId: string): Observable<WishlistActionResponse> {
    return this.wishlistService.addItem(productId).pipe(
      tap((res) => {
        if (res.success) {
          this.productIds.update((set) => new Set([...set, productId]));
        }
      }),
    );
  }

  removeItem(productId: string): Observable<WishlistActionResponse> {
    return this.wishlistService.removeItem(productId).pipe(
      tap((res) => {
        if (res.success) {
          this.productIds.update((set) => {
            const next = new Set(set);
            next.delete(productId);
            return next;
          });
        }
      }),
    );
  }

  clearWishlist(): Observable<WishlistActionResponse> {
    return this.wishlistService.clearWishlist().pipe(
      tap((res) => {
        if (res.success) {
          this.productIds.set(new Set());
        }
      }),
    );
  }
}
