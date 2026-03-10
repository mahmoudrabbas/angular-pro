import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface WishlistImage {
  _id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface WishlistProduct {
  _id: string;
  name: string;
  price: number;
  oldPrice?: number;
  images: WishlistImage[];
  category?: string;
  inStock?: boolean;
  rating?: number;
}

export interface WishlistProductEntry {
  _id: string;
  product: WishlistProduct | null;
  addedAt: string;
}

export interface WishlistData {
  _id: string;
  user_id: string;
  products: WishlistProductEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  wishlist: WishlistData;
}

export interface WishlistActionResponse {
  success: boolean;
  message?: string;
  wishlist?: WishlistData;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private api = `${environment.apiUrl}/api/wishlists`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getWishlist(): Observable<WishlistResponse> {
    return this.http.get<WishlistResponse>(this.api, {
      headers: this.getHeaders(),
    });
  }

  addItem(productId: string): Observable<WishlistActionResponse> {
    return this.http.post<WishlistActionResponse>(
      `${this.api}/add/${productId}`,
      {},
      { headers: this.getHeaders() },
    );
  }

  //   removeItem(entryId: string): Observable<WishlistActionResponse> {
  //     return this.http.delete<WishlistActionResponse>(`${this.api}/remove/${entryId}`, {
  //       headers: this.getHeaders(),
  //     });
  //   }

  removeItem(productId: string): Observable<WishlistActionResponse> {
    return this.http.delete<WishlistActionResponse>(`${this.api}/remove/${productId}`, {
      headers: this.getHeaders(),
    });
  }

  clearWishlist(): Observable<WishlistActionResponse> {
    return this.http.delete<WishlistActionResponse>(`${this.api}/clear`, {
      headers: this.getHeaders(),
    });
  }
}
