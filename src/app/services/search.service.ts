// services/search.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface SearchProduct {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  shortDescription?: string;
  image: string | null;
  rating: number;
  score?: number;
}

export interface SearchResult {
  success: boolean;
  query: string;
  searchMethod: 'vector' | 'hybrid' | 'keyword';
  total: number;
  page: number;
  pages: number;
  products: any[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = `${environment.apiUrl}/api/search`;

  constructor(private http: HttpClient) {}

  // Full paginated search → used by the search results page
  search(
    query: string,
    options: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      page?: number;
      limit?: number;
    } = {},
  ): Observable<SearchResult> {
    const params: Record<string, string> = {};
    if (query && query.trim() !== '') {
      params['q'] = query;
    }
    if (options.category && options.category !== 'All Category')
      params['category'] = options.category;
    if (options.minPrice) params['minPrice'] = String(options.minPrice);
    if (options.maxPrice) params['maxPrice'] = String(options.maxPrice);
    if (options.page) params['page'] = String(options.page);
    if (options.limit) params['limit'] = String(options.limit);

    return this.http.get<SearchResult>(this.apiUrl, { params });
  }

  // Quick suggestions → used by the navbar dropdown (top 5)
  getSuggestions(query: string): Observable<{ products: SearchProduct[] }> {
    if (!query || query.trim().length < 2) return of({ products: [] });
    return this.http
      .get<{ products: SearchProduct[] }>(`${this.apiUrl}/suggest`, { params: { q: query } })
      .pipe(catchError(() => of({ products: [] })));
  }
}
