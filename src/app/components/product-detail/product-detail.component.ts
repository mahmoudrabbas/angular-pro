import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  error: string | null = null;
  selectedImage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProduct(id).subscribe({
      next: (data) => {
        this.product = data;
        this.selectedImage = data.images?.[0] || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4OiXqm0-LnXGn8M-wzD7R5E8zkuPtdEjhVUF6FfCafKXU85nMOsYcME8&s';
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load product details.';
        this.loading = false;
        console.error('Error loading product:', err);
      }
    });
  }

  addToCart(): void {
    // Implement add to cart functionality
    console.log('Adding to cart:', this.product);
    // You can show a toast or notification here
    alert(`${this.product?.name} added to cart!`);
  }

  buyNow(): void {
    // Implement buy now functionality
    console.log('Buy now:', this.product);
    this.router.navigate(['/checkout']);
  }
}