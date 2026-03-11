import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/api/products`;

  constructor(private http: HttpClient) {}

  // Get all products from API
  getAll(page?: number, limit?: number): Observable<Product[]> {
    let url = this.apiUrl;
    if (page || limit) {
      url += `?`;
      if (page) url += `page=${page}`;
      if (page && limit) url += `&`;
      if (limit) url += `limit=${limit}`;
    }
    return this.http.get<any>(url).pipe(
      map((response) => {
        const products = response.products || response;
        const mappedProducts = (Array.isArray(products) ? products : []).map((product: any) =>
          this.mapApiToProduct(product),
        );
        return mappedProducts;
      }),
    );
  }

  // Get full paginated response
  getPaginated(page: number = 1, limit: number = 10): Observable<{ products: Product[], total: number, page: number, pages: number }> {
    return this.http.get<any>(`${this.apiUrl}?page=${page}&limit=${limit}`).pipe(
      map(response => {
        const products = response.products || response;
        const mappedProducts = (Array.isArray(products) ? products : []).map((p: any) =>
          this.mapApiToProduct(p)
        );
        return {
          products: mappedProducts,
          total: response.total || mappedProducts.length,
          page: response.page || 1,
          pages: response.pages || 1
        };
      })
    );
  }

  // Add a new product to the API
  create(product: any): Observable<Product> {
    console.log('Creating product with data, images:', product.images);
    return this.http.post<any>(this.apiUrl, product).pipe(
      map((response) => {
        console.log('Product API response:', response);
        // Handle nested response format {success: true, product: {...}}
        const productData = response.product || response;
        
        console.log('productData.images:', productData.images);
        console.log('input product.images:', product.images);
        
        // If backend doesn't return images, use the ones we sent
        const mappedProduct = this.mapApiToProduct(productData);
        const hasNoImages = !productData.images || !productData.images.length || 
                           (productData.images.length === 1 && !productData.images[0]);
        
        if (hasNoImages && product.images && product.images.length > 0) {
          console.log('Using input images since backend didn\'t return any');
          console.log('Setting image to:', product.images[0]);
          mappedProduct.image = product.images[0] || mappedProduct.image;
        }
        return mappedProduct;
      }),
    );
  }

  // Update an existing product
  update(id: string, product: Partial<Product>): Observable<Product> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, product)
      .pipe(map((response) => {
        // Handle nested response format {success: true, product: {...}}
        const productData = response.product || response;
        return this.mapApiToProduct(productData);
      }));
  }

  // Delete a product
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get products by tab (all, new, featured, top)
  getByTab(tab: 'all' | 'new' | 'featured' | 'top', page?: number, limit?: number): Observable<Product[]> {
    return this.getAll(page, limit).pipe(
      map((products) => {
        if (tab === 'all') return products;

        // For other tabs, we'll need to filter based on API response
        // For now, return all products and let the API handle filtering
        return products;
      }),
    );
  }

  getPaginatedByTab(tab: 'all' | 'new' | 'featured' | 'top', page: number = 1, limit: number = 10): Observable<{ products: Product[], total: number, page: number, pages: number }> {
     return this.getPaginated(page, limit).pipe(
        map((res) => {
           if (tab === 'all') return res;
           return res; // let API handle filters later
        })
     )
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
    console.log('DEBUG: Mapping product, raw response:', JSON.stringify(apiProduct).substring(0, 500));
    
    let imageUrl = 'assets/img/product-1.png';
    
    if (apiProduct.images && apiProduct.images.length > 0) {
      const firstImage = apiProduct.images[0];
      console.log('DEBUG: First image:', firstImage);
      
      if (typeof firstImage === 'string') {
        imageUrl = firstImage || imageUrl;
      } else if (firstImage && typeof firstImage === 'object') {
        imageUrl = firstImage.url || firstImage.uri || imageUrl;
      }
    }
    // Also check for direct 'image' property
    if (!imageUrl || imageUrl === 'assets/img/product-1.png') {
      if (apiProduct.image) {
        console.log('DEBUG: Using direct image property:', apiProduct.image);
        imageUrl = apiProduct.image;
      }
    }
    
    console.log('DEBUG: Final imageUrl:', imageUrl);

    const price = apiProduct.price || 0;
    const compareAtPrice = apiProduct.compareAtPrice || price;
    
    // Handle category - can be string ID, object with name, or shortDescription fallback
    let category = 'Electronics';
    if (apiProduct.category) {
      if (typeof apiProduct.category === 'object') {
        category = apiProduct.category.name || apiProduct.shortDescription || 'Electronics';
      } else {
        // Category is a string ID - we can't display the name without fetching it
        category = apiProduct.shortDescription || 'Electronics';
      }
    }

    return {
      id: apiProduct._id || apiProduct.id || Math.random(),
      image: imageUrl,
      category: category,
      name: apiProduct.name || 'Unknown Product',
      oldPrice: `$${compareAtPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      newPrice: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      rating: apiProduct.ratings?.average ? Math.round(apiProduct.ratings.average) : 4,
      badge: apiProduct.isFeatured ? 'New' : null,
      tab: ['all'],
    };
  }
}
