import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Product, Review, CreateReviewRequest } from '../../models/product.model';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

  // Review-related properties
  reviews: Review[] = [];
  loadingReviews = false;
  reviewError: string | null = null;
  totalReviews = 0;
  canWriteReview = true; // Allow all users to write reviews
  submittingReview = false;
  newReview: CreateReviewRequest = {
    productId: '',
    rating: 0,
    comment: '',
    title: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private cartService: CartService,
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadProduct(id);
        this.loadReviews(id);
        this.checkUserCanWriteReview(id);
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

  loadReviews(productId: string): void {
    this.loadingReviews = true;
    this.reviewError = null;
    
    this.reviewService.getProductReviews(productId).subscribe({
      next: (response) => {
        if (response.success) {
          this.reviews = response.reviews || [];
          this.totalReviews = response.totalReviews || 0;
        }
        this.loadingReviews = false;
      },
      error: (err) => {
        console.error('Failed to load reviews:', err);
        this.reviewError = 'Failed to load reviews. Please try again later.';
        this.loadingReviews = false;
      }
    });
  }

  refreshReviews(): void {
    if (this.product) {
      this.loadReviews(this.product.id.toString());
    }
  }

  checkUserCanWriteReview(productId: string): void {
    // Allow all users to write reviews - no authentication required
    this.canWriteReview = true;
    console.log('Reviews are now open to all users (no login required)');
  }

  setRating(rating: number): void {
    this.newReview.rating = rating;
  }

  submitReview(): void {
    if (!this.product || this.submittingReview) {
      return;
    }

    this.submittingReview = true;
    this.newReview.productId = this.product.id.toString();

    this.reviewService.createReview(this.newReview).subscribe({
      next: (response) => {
        if (response.success && response.review) {
          // Add the new review to the list
          this.reviews.unshift(response.review);
          this.totalReviews++;
          
          // Reset form
          this.newReview = {
            productId: this.product!.id.toString(),
            rating: 0,
            comment: '',
            title: ''
          };
          
          // Allow users to write multiple reviews (no restriction)
          // this.canWriteReview = false; // Commented out to allow multiple reviews
        }
        this.submittingReview = false;
      },
      error: (err) => {
        console.error('Failed to submit review:', err);
        // Provide more specific error messages
        if (err.status === 404 && err.error?.message === 'Product not found') {
          this.reviewError = 'Product not found. Please try refreshing the page.';
        } else if (err.status === 401 || err.status === 403) {
          this.reviewError = 'Authentication required. Please sign in to submit a review.';
        } else {
          this.reviewError = 'Failed to submit review. Please try again later.';
        }
        this.submittingReview = false;
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
