import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Order, OrderResponse } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private api = `${environment.apiUrl}/api/orders`;

    constructor(private http: HttpClient) { }

    /** Get authenticated user's orders */
    getMyOrders(): Observable<OrderResponse> {
        return this.http.get<OrderResponse>(`${this.api}/my-orders`);
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
