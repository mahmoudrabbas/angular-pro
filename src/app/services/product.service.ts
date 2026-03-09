import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  // Get all products from API
  getAll(): Observable<Product[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map((response) => {
        console.log('API Response:', response);
        const products = response.products || response;
        const mappedProducts = (Array.isArray(products) ? products : []).map((product: any) =>
          this.mapApiToProduct(product),
        );
        console.log('Mapped Products:', mappedProducts);
        return mappedProducts;
      }),
    );
  }

  // Add a new product to the API
  create(product: Omit<Product, 'id' | 'tab'>): Observable<Product> {
    console.log('Creating product with data:', product);
    return this.http.post<any>(this.apiUrl, product).pipe(
      map((response) => {
        console.log('Product API response:', response);
        return this.mapApiToProduct(response);
      }),
    );
  }

  // Update an existing product
  update(id: string, product: Partial<Product>): Observable<Product> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, product)
      .pipe(map((response) => this.mapApiToProduct(response)));
  }

  // Delete a product
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get products by tab (all, new, featured, top)
  getByTab(tab: 'all' | 'new' | 'featured' | 'top'): Observable<Product[]> {
    return this.getAll().pipe(
      map((products) => {
        if (tab === 'all') return products;

        // For other tabs, we'll need to filter based on API response
        // For now, return all products and let the API handle filtering
        return products;
      }),
    );
  }

  // Get product by ID - with fallback to full list if single-product endpoint fails
  getById(id: string): Observable<Product | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response) => {
        // Handle wrapped response {product: {...}} or raw product
        const product = response.product || response;
        return this.mapApiToProduct(product);
      }),
      catchError((err) => {
        console.warn('Single product endpoint failed, falling back to full list:', err.status);
        // Fallback: fetch all products and find by ID
        return this.getAll().pipe(
          map((products) => products.find((p) => p.id === id || p.id.toString() === id)),
        );
      }),
    );
  }

  // Get raw API product by ID (for detail page with full data)
  getProductDetailById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((response) => response.product || response),
      catchError((err) => {
        console.warn('Single product endpoint failed, falling back to full list:', err.status);
        return this.http.get<any>(this.apiUrl).pipe(
          map((response) => {
            const products = response.products || response;
            const arr = Array.isArray(products) ? products : [];
            return arr.find((p: any) => p._id === id || p.id === id);
          }),
        );
      }),
    );
  }

  // Map API response to Product interface
  private mapApiToProduct(apiProduct: any): Product {
    // Extract image URL - API returns images as [{url: "...", ...}]
    let imageUrl = 'assets/img/product-1.png';
    if (apiProduct.images && apiProduct.images.length > 0) {
      imageUrl = apiProduct.images[0].url || apiProduct.images[0] || imageUrl;
    }

    const price = apiProduct.price || 0;
    const compareAtPrice = apiProduct.compareAtPrice || price;

    return {
      id: apiProduct._id || apiProduct.id || Math.random(),
      image: imageUrl,
      category: apiProduct.category?.name || apiProduct.shortDescription || 'Electronics',
      name: apiProduct.name || 'Unknown Product',
      oldPrice: `$${compareAtPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      newPrice: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      rating: apiProduct.ratings?.average ? Math.round(apiProduct.ratings.average) : 4,
      badge: apiProduct.isFeatured ? 'New' : null,
      tab: ['all'],
    };
  }
}
