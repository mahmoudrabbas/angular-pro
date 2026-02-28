// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Observable, of } from 'rxjs';
// import { Product } from '../models/product.model';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProductService {
//   private apiUrl = 'http://localhost:3000/api/products'; // Update with  API URL

//   private mockProducts: Product[] = [
//     {
//       _id: '1',
//       name: 'MacBook Air M4',
//       description: 'Latest MacBook Air with M4 chip, 16GB RAM, 512GB SSD',
//       price: 1299.99,
//       category: '6998d0b3c754a6a9c45941db',
//       sku: 'MBA-M4-001',
//       inventory: 25,
//       seo: { slug: 'macbook-air-m4' },
//       images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4OiXqm0-LnXGn8M-wzD7R5E8zkuPtdEjhVUF6FfCafKXU85nMOsYcME8&s']
//     },
//     {
//       _id: '2',
//       name: 'iPhone 15 Pro',
//       description: 'Apple iPhone 15 Pro with A17 Pro chip, Titanium design',
//       price: 999.99,
//       category: '6998d0b3c754a6a9c45941db',
//       sku: 'IPHONE-004',
//       inventory: 50,
//       seo: { slug: 'apple-iphone-15-pro' },
//       images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4OiXqm0-LnXGn8M-wzD7R5E8zkuPtdEjhVUF6FfCafKXU85nMOsYcME8&s']
//     },
//     {
//       _id: '3',
//       name: 'iPad Pro M4',
//       description: '12.9-inch iPad Pro with M4 chip, Liquid Retina XDR display',
//       price: 1099.99,
//       category: '6998d0b3c754a6a9c45941db',
//       sku: 'IPAD-M4-003',
//       inventory: 30,
//       seo: { slug: 'ipad-pro-m4' },
//       images: ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4OiXqm0-LnXGn8M-wzD7R5E8zkuPtdEjhVUF6FfCafKXU85nMOsYcME8&s']
//     }
//   ];

//   constructor(private http: HttpClient) {}

//   getProducts(): Observable<Product[]> {
//     // Replace with actual API call
//     // return this.http.get<Product[]>(this.apiUrl);
//     return of(this.mockProducts);
//   }

//   getProduct(id: string): Observable<Product> {
//     // Replace with actual API call
//     // return this.http.get<Product>(`${this.apiUrl}/${id}`);
//     const product = this.mockProducts.find(p => p._id === id);
//     return of(product as Product);
//   }

//   getProductBySlug(slug: string): Observable<Product> {
//     // Replace with actual API call
//     // return this.http.get<Product>(`${this.apiUrl}/slug/${slug}`);
//     const product = this.mockProducts.find(p => p.seo.slug === slug);
//     return of(product as Product);
//   }
// }

import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products: Product[] = [
    // All Products
    {
      id: 1,
      image: 'assets/img/product-3.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: 'New',
      tab: ['all'],
    },
    {
      id: 2,
      image: 'assets/img/product-4.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: 'Sale',
      tab: ['all'],
    },
    {
      id: 3,
      image: 'assets/img/product-5.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: null,
      tab: ['all'],
    },
    {
      id: 4,
      image: 'assets/img/product-6.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: 'New',
      tab: ['all'],
    },
    {
      id: 5,
      image: 'assets/img/product-7.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: 'Sale',
      tab: ['all'],
    },
    {
      id: 6,
      image: 'assets/img/product-8.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: null,
      tab: ['all'],
    },
    {
      id: 7,
      image: 'assets/img/product-9.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: 'New',
      tab: ['all'],
    },
    {
      id: 8,
      image: 'assets/img/product-10.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: 'Sale',
      tab: ['all'],
    },
    // New Arrivals
    {
      id: 9,
      image: 'assets/img/product-3.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: 'New',
      tab: ['new'],
    },
    {
      id: 10,
      image: 'assets/img/product-4.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: 'New',
      tab: ['new'],
    },
    {
      id: 11,
      image: 'assets/img/product-5.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: 'New',
      tab: ['new'],
    },
    {
      id: 12,
      image: 'assets/img/product-6.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: 'New',
      tab: ['new'],
    },
    // Featured
    {
      id: 13,
      image: 'assets/img/product-9.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: null,
      tab: ['featured'],
    },
    {
      id: 14,
      image: 'assets/img/product-10.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: null,
      tab: ['featured'],
    },
    {
      id: 15,
      image: 'assets/img/product-11.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: null,
      tab: ['featured'],
    },
    {
      id: 16,
      image: 'assets/img/product-12.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: null,
      tab: ['featured'],
    },
    // Top Selling
    {
      id: 17,
      image: 'assets/img/product-14.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: null,
      tab: ['top'],
    },
    {
      id: 18,
      image: 'assets/img/product-15.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: null,
      tab: ['top'],
    },
    {
      id: 19,
      image: 'assets/img/product-17.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: null,
      tab: ['top'],
    },
    {
      id: 20,
      image: 'assets/img/product-16.png',
      category: 'SmartPhone',
      name: 'Apple iPad Mini G2356',
      oldPrice: '$1,250.00',
      newPrice: '$1,050.00',
      rating: 4,
      badge: null,
      tab: ['top'],
    },
  ];

  getAll(): Product[] {
    return this.products;
  }

  getByTab(tab: 'all' | 'new' | 'featured' | 'top'): Product[] {
    return this.products.filter((p) => p.tab.includes(tab));
  }

  getById(id: number): Product | undefined {
    return this.products.find((p) => p.id === id);
  }
}
