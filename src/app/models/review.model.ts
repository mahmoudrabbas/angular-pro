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