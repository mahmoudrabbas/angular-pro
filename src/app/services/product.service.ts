import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/products'; // Update with  API URL


  private mockProducts: Product[] = [
    {
      _id: '1',
      name: 'MacBook Air M4',
      description: 'Latest MacBook Air with M4 chip, 16GB RAM, 512GB SSD',
      price: 1299.99,
      category: '6998d0b3c754a6a9c45941db',
      sku: 'MBA-M4-001',
      inventory: 25,
      seo: { slug: 'macbook-air-m4' },
      images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4OiXqm0-LnXGn8M-wzD7R5E8zkuPtdEjhVUF6FfCafKXU85nMOsYcME8&s']
    },
    {
      _id: '2',
      name: 'iPhone 15 Pro',
      description: 'Apple iPhone 15 Pro with A17 Pro chip, Titanium design',
      price: 999.99,
      category: '6998d0b3c754a6a9c45941db',
      sku: 'IPHONE-004',
      inventory: 50,
      seo: { slug: 'apple-iphone-15-pro' },
      images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4OiXqm0-LnXGn8M-wzD7R5E8zkuPtdEjhVUF6FfCafKXU85nMOsYcME8&s']
    },
    {
      _id: '3',
      name: 'iPad Pro M4',
      description: '12.9-inch iPad Pro with M4 chip, Liquid Retina XDR display',
      price: 1099.99,
      category: '6998d0b3c754a6a9c45941db',
      sku: 'IPAD-M4-003',
      inventory: 30,
      seo: { slug: 'ipad-pro-m4' },
      images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4OiXqm0-LnXGn8M-wzD7R5E8zkuPtdEjhVUF6FfCafKXU85nMOsYcME8&s']
    }
  ];

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> {
    // Replace with actual API call
    // return this.http.get<Product[]>(this.apiUrl);
    return of(this.mockProducts);
  }

  getProduct(id: string): Observable<Product> {
    // Replace with actual API call
    // return this.http.get<Product>(`${this.apiUrl}/${id}`);
    const product = this.mockProducts.find(p => p._id === id);
    return of(product as Product);
  }

  getProductBySlug(slug: string): Observable<Product> {
    // Replace with actual API call
    // return this.http.get<Product>(`${this.apiUrl}/slug/${slug}`);
    const product = this.mockProducts.find(p => p.seo.slug === slug);
    return of(product as Product);
  }
}