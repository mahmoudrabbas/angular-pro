import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError, of, forkJoin } from 'rxjs';
import { environment } from '../environments/environment';
import {
    Cart,
    CartResponse,
    CartActionResponse,
    CheckoutResponse,
    GuestCartItem,
} from '../models/cart.model';
import { ShippingAddress } from '../models/order.model';
import { ToastService } from './toast.service';

const GUEST_CART_KEY = 'guest_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
    private api = `${environment.apiUrl}/api/cart`;

    // Reactive cart state
    cart = signal<Cart | null>(null);
    loading = signal(false);
    error = signal<string | null>(null);

    // Computed signals
    cartItemCount = computed(() => {
        const c = this.cart();
        return c ? c.totalItems : 0;
    });

    cartTotal = computed(() => {
        const c = this.cart();
        return c ? c.totalPrice : 0;
    });

    constructor(
        private http: HttpClient,
        private toastService: ToastService,
    ) { }

    // ─── Auth helpers ───────────────────────────────────────────────

    private isLoggedIn(): boolean {
        return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
    }

    private getAuthHeaders(): { headers: HttpHeaders } {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return { headers };
    }

    // ─── Guest cart (localStorage) helpers ───────────────────────────

    private getGuestItems(): GuestCartItem[] {
        try {
            const raw = localStorage.getItem(GUEST_CART_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    private saveGuestItems(items: GuestCartItem[]): void {
        localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }

    private clearGuestItems(): void {
        localStorage.removeItem(GUEST_CART_KEY);
    }

    /** Build a Cart object from guest items so the UI can use the same template */
    private guestItemsToCart(items: GuestCartItem[]): Cart {
        const cartItems = items.map((g, i) => ({
            _id: `guest-${i}`,
            product: {
                _id: g.productId,
                name: g.name,
                price: g.price,
                images: [g.image],
                inventory: { quantity: 99 },
            },
            quantity: g.quantity,
            itemTotal: g.price * g.quantity,
        }));

        const totalItems = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);
        const totalPrice = cartItems.reduce((sum, ci) => sum + ci.itemTotal, 0);

        return {
            _id: 'guest',
            items: cartItems,
            totalItems,
            totalPrice,
        };
    }

    private syncGuestSignal(): void {
        const items = this.getGuestItems();
        if (items.length > 0) {
            this.cart.set(this.guestItemsToCart(items));
        } else {
            this.cart.set(null);
        }
    }

    // ─── Public API ─────────────────────────────────────────────────

    /** Fetch cart — from backend for logged-in users, from localStorage for guests */
    loadCart(): void {
        if (!this.isLoggedIn()) {
            this.syncGuestSignal();
            return;
        }

        this.loading.set(true);
        this.error.set(null);
        this.http
            .get<CartResponse>(this.api, this.getAuthHeaders())
            .pipe(
                tap((res) => {
                    if (res.success) {
                        this.cart.set(res.cart);
                    }
                    this.loading.set(false);
                }),
                catchError((err) => {
                    this.error.set(err?.error?.message || 'Failed to load cart');
                    this.loading.set(false);
                    return throwError(() => err);
                }),
            )
            .subscribe();
    }

    /** Add item to cart */
    addToCart(
        productId: string,
        quantity: number = 1,
        productMeta?: { name: string; price: number; image: string },
    ): Observable<CartActionResponse> {
        // Guest path — save to localStorage
        if (!this.isLoggedIn()) {
            const items = this.getGuestItems();
            const existing = items.find((i) => i.productId === productId);

            if (existing) {
                existing.quantity += quantity;
            } else {
                items.push({
                    productId,
                    name: productMeta?.name ?? 'Product',
                    price: productMeta?.price ?? 0,
                    image: productMeta?.image ?? 'assets/img/product-3.png',
                    quantity,
                });
            }

            this.saveGuestItems(items);
            this.syncGuestSignal();
            this.toastService.success('Item added to cart ✓');

            return of({ success: true, message: 'Added to guest cart' });
        }

        // Logged-in path — call backend API
        return this.http
            .post<CartActionResponse>(`${this.api}/items`, {
                product_id: productId,
                quantity,
            }, this.getAuthHeaders())
            .pipe(
                tap(() => {
                    this.loadCart();
                    this.toastService.success('Item added to cart ✓');
                }),
                catchError((err) => {
                    this.error.set(err?.error?.message || 'Failed to add to cart');
                    this.toastService.error('Failed to add item to cart');
                    return throwError(() => err);
                }),
            );
    }

    /** Update item quantity */
    updateQuantity(productId: string, quantity: number): Observable<CartActionResponse> {
        if (!this.isLoggedIn()) {
            const items = this.getGuestItems();
            const item = items.find((i) => i.productId === productId);
            if (item) {
                item.quantity = quantity;
                this.saveGuestItems(items);
                this.syncGuestSignal();
            }
            return of({ success: true, message: 'Updated' });
        }

        return this.http
            .patch<CartActionResponse>(`${this.api}/items/${productId}`, {
                quantity,
            }, this.getAuthHeaders())
            .pipe(
                tap(() => this.loadCart()),
                catchError((err) => {
                    this.error.set(err?.error?.message || 'Failed to update quantity');
                    return throwError(() => err);
                }),
            );
    }

    /** Remove item from cart */
    removeItem(productId: string): Observable<CartActionResponse> {
        if (!this.isLoggedIn()) {
            const items = this.getGuestItems().filter((i) => i.productId !== productId);
            this.saveGuestItems(items);
            this.syncGuestSignal();
            this.toastService.info('Item removed from cart');
            return of({ success: true, message: 'Removed' });
        }

        return this.http
            .delete<CartActionResponse>(`${this.api}/items/${productId}`, this.getAuthHeaders())
            .pipe(
                tap(() => {
                    this.loadCart();
                    this.toastService.info('Item removed from cart');
                }),
                catchError((err) => {
                    this.error.set(err?.error?.message || 'Failed to remove item');
                    return throwError(() => err);
                }),
            );
    }

    /** Clear entire cart */
    clearCart(): Observable<CartActionResponse> {
        if (!this.isLoggedIn()) {
            this.clearGuestItems();
            this.cart.set(null);
            this.toastService.info('Cart cleared');
            return of({ success: true, message: 'Cleared' });
        }

        return this.http.delete<CartActionResponse>(this.api, this.getAuthHeaders()).pipe(
            tap(() => {
                this.cart.set(null);
                this.toastService.info('Cart cleared');
            }),
            catchError((err) => {
                this.error.set(err?.error?.message || 'Failed to clear cart');
                return throwError(() => err);
            }),
        );
    }

    /** Checkout – converts cart into a pending order */
    checkout(
        shippingAddress: ShippingAddress,
        paymentMethod: string = 'card',
    ): Observable<CheckoutResponse> {
        return this.http
            .post<CheckoutResponse>(`${this.api}/checkout`, {
                shippingAddress,
                paymentMethod,
            }, this.getAuthHeaders())
            .pipe(
                tap(() => this.cart.set(null)),
                catchError((err) => {
                    this.error.set(err?.error?.message || 'Checkout failed');
                    return throwError(() => err);
                }),
            );
    }

    // ─── Cart Merge (guest → server on login) ──────────────────────

    /**
     * Merge guest cart items into the authenticated user's server cart.
     * Each guest item is POSTed to the backend (which handles duplicates
     * by increasing quantity). After merge, localStorage is cleared.
     */
    mergeGuestCart(): void {
        const guestItems = this.getGuestItems();
        if (guestItems.length === 0) {
            this.loadCart();
            return;
        }

        const requests = guestItems.map((item) =>
            this.http.post<CartActionResponse>(`${this.api}/items`, {
                product_id: item.productId,
                quantity: item.quantity,
            }, this.getAuthHeaders()).pipe(
                catchError(() => of({ success: false, message: 'Failed to merge item' })),
            ),
        );

        forkJoin(requests).subscribe({
            next: () => {
                this.clearGuestItems();
                this.loadCart();
                this.toastService.success('Your cart has been synced ✓');
            },
            error: () => {
                this.clearGuestItems();
                this.loadCart();
            },
        });
    }
}
