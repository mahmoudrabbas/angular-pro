import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Order, OrderResponse } from '../models/order.model';

export interface ApiOrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  _id: string;
}

export interface ApiOrder {
  _id: string;
  user: string;
  items: ApiOrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  orderNumber: string;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    city: string;
    country: string;
  };
}

export interface ApiResponse {
  success: boolean;
  count: number;
  data: ApiOrder[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private api = `${environment.apiUrl}/api/orders`;

  constructor(private http: HttpClient) {}

  getMyOrders(): Observable<ApiResponse> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.get<ApiResponse>(this.api + '/my-orders', { headers });
  }
  /** Get a single order by ID */
  getOrder(id: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.api}/${id}`);
  }

  /** Cancel an order */
  cancelOrder(id: string): Observable<OrderResponse> {
    return this.http.put<OrderResponse>(`${this.api}/${id}/cancel`, {});
  }
}
