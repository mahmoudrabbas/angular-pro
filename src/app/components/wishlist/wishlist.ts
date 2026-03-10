import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { WishlistService, WishlistProductEntry } from '../../services/wishlist.service';
import { ProductCardComponent } from '../product-card/product-card';
import { Product } from '../../models/product.model';
import { WishlistStateService } from '../../services/wishlist-state.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, Sidebar, ProductCardComponent],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist implements OnInit {
  private wishlistService = inject(WishlistService);
  private wishlistStateService = inject(WishlistStateService);

  allEntries = signal<WishlistProductEntry[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');

  clearing = signal(false);

  clearAll() {
    if (this.clearing()) return;
    this.clearing.set(true);

    this.wishlistService.clearWishlist().subscribe({
      next: () => {
        this.allEntries.set([]);
        this.wishlistStateService.clear(); // update ma global state
        this.clearing.set(false);
      },
      error: () => this.clearing.set(false),
    });
  }

  products = computed<Product[]>(() =>
    this.allEntries()
      .filter((e) => e.product !== null)
      .map((e) => this.mapToProduct(e)),
  );

  ngOnInit() {
    this.loadWishlist();
  }

  loadWishlist() {
    this.isLoading.set(true);
    this.errorMsg.set('');

    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        if (res.success && res.wishlist?.products) {
          this.allEntries.set(res.wishlist.products);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(
          err.status === 401
            ? 'Session expired. Please log in again.'
            : 'Failed to load wishlist. Please try again.',
        );
        this.isLoading.set(false);
      },
    });
  }

  removeEntry(productId: string) {
    this.allEntries.update((list) => list.filter((e) => e.product?._id !== productId));
  }

  private mapToProduct(entry: WishlistProductEntry): Product {
    const p = entry.product!;
    const images = p.images ?? [];
    const primary = images.find((img) => img.isPrimary);
    const imageUrl = primary?.url ?? images[0]?.url ?? 'assets/img/product-1.png';
    const price = p.price ?? 0;
    const oldPrice = p.oldPrice ?? price;

    return {
      id: p._id,
      image: imageUrl,
      category: p.category ?? 'Electronics',
      name: p.name,
      oldPrice: `$${oldPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      newPrice: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      rating: p.rating ?? 4,
      badge: null,
      tab: ['all'],
    };
  }
}
