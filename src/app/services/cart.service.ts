import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import {
    Cart,
    CartResponse,
    CartActionResponse,
    CheckoutResponse,
} from '../models/cart.model';
import { ShippingAddress } from '../models/order.model';

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

    constructor(private http: HttpClient) { }

    /** Get auth headers directly from storage */
    private getAuthHeaders(): { headers: HttpHeaders } {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return { headers };
    }

    /** Fetch cart from backend */
    loadCart(): void {
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
    addToCart(productId: string, quantity: number = 1): Observable<CartActionResponse> {
        return this.http
            .post<CartActionResponse>(`${this.api}/items`, {
                product_id: productId,
                quantity,
            }, this.getAuthHeaders())
            .pipe(
                tap(() => this.loadCart()),
                catchError((err) => {
                    this.error.set(err?.error?.message || 'Failed to add to cart');
                    return throwError(() => err);
                }),
            );
    }

    /** Update item quantity */
    updateQuantity(productId: string, quantity: number): Observable<CartActionResponse> {
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
        return this.http
            .delete<CartActionResponse>(`${this.api}/items/${productId}`, this.getAuthHeaders())
            .pipe(
                tap(() => this.loadCart()),
                catchError((err) => {
                    this.error.set(err?.error?.message || 'Failed to remove item');
                    return throwError(() => err);
                }),
            );
    }

    /** Clear entire cart */
    clearCart(): Observable<CartActionResponse> {
        return this.http.delete<CartActionResponse>(this.api, this.getAuthHeaders()).pipe(
            tap(() => this.cart.set(null)),
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
}
