import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { 
  Review, 
  CreateReviewRequest, 
  ReviewResponse, 
  ReviewsResponse 
} from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/api/reviews`;

  constructor(private http: HttpClient) {}

  /** Get auth headers directly from storage */
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers };
  }

  /** Get all reviews for a product */
  getProductReviews(productId: string): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(`${this.apiUrl}/product/${productId}`).pipe(
      catchError((err) => {
        console.error('Failed to load reviews:', err);
        return throwError(() => err);
      })
    );
  }

  /** Create a new review for a product */
  createReview(reviewData: CreateReviewRequest): Observable<ReviewResponse> {
    // Remove authentication requirement - allow reviews without login
    // Add error handling for product not found
    return this.http.post<ReviewResponse>(`${this.apiUrl}`, reviewData).pipe(
      catchError((err) => {
        console.error('Failed to create review:', err);
        // Handle specific error cases
        if (err.status === 404 && err.error?.message === 'Product not found') {
          console.error('Product not found - ensure the product ID is valid');
        }
        return throwError(() => err);
      })
    );
  }

  /** Update an existing review */
  updateReview(reviewId: string, reviewData: Partial<CreateReviewRequest>): Observable<ReviewResponse> {
    return this.http.put<ReviewResponse>(`${this.apiUrl}/${reviewId}`, reviewData, this.getAuthHeaders()).pipe(
      catchError((err) => {
        console.error('Failed to update review:', err);
        return throwError(() => err);
      })
    );
  }

  /** Delete a review */
  deleteReview(reviewId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${reviewId}`, this.getAuthHeaders()).pipe(
      catchError((err) => {
        console.error('Failed to delete review:', err);
        return throwError(() => err);
      })
    );
  }

  /** Get user's review for a product (to check if they already reviewed) */
  getUserReviewForProduct(productId: string): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(`${this.apiUrl}/user/product/${productId}`, this.getAuthHeaders()).pipe(
      catchError((err) => {
        // Return empty response if no review found (404)
        if (err.status === 404) {
          return throwError(() => ({ success: false, message: 'No review found' }));
        }
        console.error('Failed to get user review:', err);
        return throwError(() => err);
      })
    );
  }
}