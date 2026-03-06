import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

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
    private cartService: CartService,
  ) { }

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
    this.productService.getProductDetailById(id).subscribe({
      next: (apiProduct: any) => {
        if (apiProduct) {
          // Extract image URLs from API response
          let images: string[] = [];
          if (apiProduct.images && apiProduct.images.length > 0) {
            images = apiProduct.images.map((img: any) => img.url || img).filter(Boolean);
          }
          if (images.length === 0) {
            images = ['assets/img/product-1.png'];
          }

          const price = apiProduct.price || 0;
          const compareAtPrice = apiProduct.compareAtPrice || price;

          this.product = {
            id: apiProduct._id || apiProduct.id,
            image: images[0],
            category: apiProduct.shortDescription || apiProduct.category?.name || 'Electronics',
            name: apiProduct.name || 'Unknown Product',
            oldPrice: `$${compareAtPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            newPrice: `$${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            rating: apiProduct.ratings?.average ? Math.round(apiProduct.ratings.average) : 4,
            badge: apiProduct.isFeatured ? 'New' : null,
            tab: ['all'],
            images: images,
            description: apiProduct.description || `High-quality ${apiProduct.name}`,
            sku: apiProduct.sku || `SKU-${apiProduct._id || apiProduct.id}`,
            inventory: apiProduct.inventory?.quantity ?? 10,
          };
          this.selectedImage = images[0];
          this.error = null;
        } else {
          this.error = 'Product not found.';
        }
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Failed to load product:', err);
        this.error = 'Failed to load product. Please try again later.';
        this.loading = false;
      }
    });
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
    if (this.product) {
      this.cartService.addToCart(this.product.id.toString(), this.quantity).subscribe({
        next: () => console.log('Added to cart'),
        error: (err: any) => console.error('Failed to add to cart', err),
      });
    }
  }

  buyNow(): void {
    if (this.product) {
      this.cartService.addToCart(this.product.id.toString(), this.quantity).subscribe({
        next: () => this.router.navigate(['/checkout']),
        error: (err: any) => console.error('Failed to add to cart', err),
      });
    }
  }
}
