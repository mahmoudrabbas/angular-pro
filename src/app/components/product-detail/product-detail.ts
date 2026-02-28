import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.scss'],
})
export class ProductDetail implements OnInit {
  product:
    | (Product & {
        images: string[];
        description: string;
        sku: string;
        inventory: number;
        price?: number; // optional if needed
      })
    | null = null;
  loading = true;
  error: string | null = null;
  selectedImage: string = '';
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  loadProduct(id: string): void {
    this.loading = true;
    const productId = parseInt(id, 10);
    const product = this.productService.getById(productId);

    if (product) {
      this.product = {
        ...product,
        images: [product.image],
        description: this.getDescriptionForProduct(product),
        sku: `SKU-${product.id}`,
        inventory: 10,
      };
      this.selectedImage = this.product.images[0];
      this.error = null;
    } else {
      this.error = 'Product not found.';
    }

    this.loading = false;
  }

  // Helper to provide a description based on product
  private getDescriptionForProduct(product: Product): string {
    // You can customize based on product category or id
    return `This is a high-quality ${product.name} from our ${product.category} collection. Perfect for your daily needs.`;
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    console.log('Adding to cart:', { product: this.product, quantity: this.quantity });
  }

  buyNow(): void {
    console.log('Buy now:', { product: this.product, quantity: this.quantity });
    this.router.navigate(['/checkout']);
  }
}
