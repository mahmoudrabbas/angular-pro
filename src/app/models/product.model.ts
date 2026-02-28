export type ProductBadge = 'New' | 'Sale' | null;

export interface Product {
  id: number;
  image: string;
  category: string;
  name: string;
  oldPrice: string;
  newPrice: string;
  rating: number;
  badge: ProductBadge;
  tab: ('all' | 'new' | 'featured' | 'top')[];
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
