import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Category } from '../models/category.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/api/categories`;

  constructor(private http: HttpClient) {}

  // Get all categories from API
  getAll(): Observable<Category[]> {
    console.log('CategoryService: Getting all categories from:', this.apiUrl);
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        console.log('CategoryService: Raw API response:', response);
        // Handle both array and object response formats
        const categories = Array.isArray(response) ? response : response.categories;
        if (!categories) {
          console.log('CategoryService: No categories found in response');
          return [];
        }
        const mappedCategories = (categories as any[]).map((category: any) => this.mapApiToCategory(category));
        console.log('CategoryService: Mapped categories:', mappedCategories);
        return mappedCategories;
      })
    );
  }

  // Get category by ID
  getById(id: string): Observable<Category | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(category => this.mapApiToCategory(category))
    );
  }

  // Get category by slug
  getBySlug(slug: string): Observable<Category | undefined> {
    return this.http.get<any>(`${this.apiUrl}/slug/${slug}`).pipe(
      map(category => this.mapApiToCategory(category))
    );
  }

  // Create new category
  create(category: Omit<Category, '_id' | 'createdAt' | 'updatedAt'>): Observable<Category> {
    console.log('Creating category with data:', category);
    return this.http.post<any>(this.apiUrl, category).pipe(
      map(response => {
        console.log('Category API response:', response);
        return this.mapApiToCategory(response);
      })
    );
  }

  // Update category
  update(id: string, category: Partial<Category>): Observable<Category> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, category).pipe(
      map(response => this.mapApiToCategory(response))
    );
  }

  // Delete category
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Map API response to Category interface
  private mapApiToCategory(apiCategory: any): Category {
    return {
      _id: apiCategory._id,
      name: apiCategory.name || 'Unknown Category',
      description: apiCategory.description,
      image: apiCategory.image,
      slug: apiCategory.slug || '',
      createdAt: apiCategory.createdAt ? new Date(apiCategory.createdAt) : undefined,
      updatedAt: apiCategory.updatedAt ? new Date(apiCategory.updatedAt) : undefined
    };
  }
}