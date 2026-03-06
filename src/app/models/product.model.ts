export type ProductBadge = 'New' | 'Sale' | null;

export interface Product {
  id: number | string;
  image: string;
  category: string;
  name: string;
  oldPrice: string;
  newPrice: string;
  rating: number;
  badge: ProductBadge;
  tab: ('all' | 'new' | 'featured' | 'top')[];
  reviews?: Review[];
  totalReviews?: number;
  averageRating?: number;
}

export interface Review {
  _id: string;
  product: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  comment: string;
  title: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  comment: string;
  title: string;
}

export interface ReviewResponse {
  success: boolean;
  review?: Review;
  message?: string;
}

export interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

// export interface Product {
//   _id?: string;
//   name: string;
//   description: string;
//   price: number;
//   category: string;
//   sku: string;
//   inventory: number;
//   seo: {
//     slug: string;
//   };
//   images?: string[];
//   createdAt?: Date;
//   updatedAt?: Date;
// }
