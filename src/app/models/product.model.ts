export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  inventory: number;
  seo: {
    slug: string;
  };
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}