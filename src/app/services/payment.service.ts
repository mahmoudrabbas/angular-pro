import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface PaymentSessionResponse {
    success: boolean;
    url?: string;       // Stripe checkout URL to redirect to
    message?: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
    private api = `${environment.apiUrl}/payment`;

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

    /** Create a Stripe checkout session for the given order */
    createCheckoutSession(orderId: string): Observable<PaymentSessionResponse> {
        return this.http.post<PaymentSessionResponse>(
            `${this.api}/checkout/create/${orderId}`,
            {},
            this.getAuthHeaders(),
        );
    }
}
