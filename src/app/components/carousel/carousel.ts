import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScriptInitService } from '../../components/services/script-init.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carousel.html',
  styleUrls: ['./carousel.scss'],
})
export class CarouselComponent implements OnInit, AfterViewInit, OnDestroy {
  carouselItems: any[] = [];

  bannerOffer = {
    image: 'assets/img/header-img.jpg',
    saveText: 'Save $48.00',
    offerText: 'Special Offer',
    productName: 'Apple iPad Mini G2356',
    oldPrice: '$1,250.00',
    newPrice: '$1,050.00',
    category: 'SmartPhone',
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private scriptInit: ScriptInitService,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.loadCarouselFromProducts();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      this.scriptInit.initWOW();
    }, 500);
  }

  ngOnDestroy(): void {}

  private loadCarouselFromProducts(): void {
    // Get products from your ProductService
    const products = this.productService.getByTab('all').slice(0, 3);

    // Transform products into carousel items
    this.carouselItems = products.map((product, index) => ({
      id: product.id,
      image: product.image,
      discount: index === 0 ? 'Save Up To A $400' : 'Save Up To A $200',
      title: product.name,
      description: 'Terms and Condition Apply',
      buttonText: 'Shop Now',
      buttonLink: `/product/${product.id}`,
    }));

    // You can also update banner offer with a real product
    const featuredProduct = this.productService.getByTab('featured')[0];
    if (featuredProduct) {
      this.bannerOffer = {
        image: featuredProduct.image,
        saveText: 'Save $48.00',
        offerText: 'Special Offer',
        productName: featuredProduct.name,
        oldPrice: featuredProduct.oldPrice || '$1,250.00',
        newPrice: featuredProduct.newPrice || '$1,050.00',
        category: featuredProduct.category,
      };
    }
  }

  addToCart(): void {
    console.log('🛒 Added to cart:', this.bannerOffer.productName);
    // Find the actual product and add to cart
    const product = this.productService.getById(1); // or find by name
    if (product) {
      // Emit or call cart service
      console.log('Product details:', product);
    }
  }

  // Optional: Refresh carousel with different products
  refreshCarousel(tab: 'all' | 'new' | 'featured' | 'top' = 'all'): void {
    const products = this.productService.getByTab(tab).slice(0, 3);
    this.carouselItems = products.map((product, index) => ({
      id: product.id,
      image: product.image,
      discount: index === 0 ? 'Save Up To A $400' : 'Save Up To A $200',
      title: product.name,
      description: 'Terms and Condition Apply',
      buttonText: 'Shop Now',
      buttonLink: `/product/${product.id}`,
    }));
  }
}
