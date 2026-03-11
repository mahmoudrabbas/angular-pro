import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category.model';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  sku: string;
  inventory: number;
  images: string[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.scss'],
})
export class AdminDashboard {
  stats: Stats = {
    totalProducts: 1234,
    totalOrders: 567,
    totalUsers: 8901,
    totalRevenue: 234567,
  };

  recentOrders: Order[] = [
    { id: 'ORD-001', customer: 'John Doe', date: '2024-03-05', total: 299.99, status: 'Completed' },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      date: '2024-03-05',
      total: 149.5,
      status: 'Processing',
    },
    {
      id: 'ORD-003',
      customer: 'Bob Johnson',
      date: '2024-03-04',
      total: 549.99,
      status: 'Pending',
    },
    {
      id: 'ORD-004',
      customer: 'Alice Williams',
      date: '2024-03-04',
      total: 89.99,
      status: 'Completed',
    },
    {
      id: 'ORD-005',
      customer: 'Charlie Brown',
      date: '2024-03-03',
      total: 399.99,
      status: 'Cancelled',
    },
  ];

  // Product form state
  isAddingProduct = false;
  productForm: ProductFormData = {
    name: '',
    description: '',
    price: 0,
    category: '',
    sku: '',
    inventory: 0,
    images: []
  };
  productFormErrors: { [key: string]: string } = {};
  productFormSuccess = false;

  // Category form state
  isAddingCategory = false;
  categoryForm = {
    name: '',
    description: '',
    image: ''
  };
  categoryFormErrors: { [key: string]: string } = {};
  categoryFormSuccess = false;

  // Categories for dropdown
  categories: Category[] = [];

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'dot-confirmed';
      case 'Processing':
      case 'Pending':
      case 'Cancelled':
        return 'dot-pending';
      default:
        return 'dot-pending';
    }
  }

  trackById(index: number, order: Order): string {
    return order.id;
  }

  // Toggle product form
  toggleProductForm(): void {
    this.isAddingProduct = !this.isAddingProduct;
    if (!this.isAddingProduct) {
      this.resetProductForm();
    }
  }

  // Toggle category form
  toggleCategoryForm(): void {
    this.isAddingCategory = !this.isAddingCategory;
    if (!this.isAddingCategory) {
      this.resetCategoryForm();
    }
  }

  // Reset forms
  resetProductForm(): void {
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      category: '',
      sku: '',
      inventory: 0,
      images: []
    };
    this.productFormErrors = {};
    this.productFormSuccess = false;
  }

  resetCategoryForm(): void {
    this.categoryForm = {
      name: '',
      description: '',
      image: ''
    };
    this.categoryFormErrors = {};
    this.categoryFormSuccess = false;
  }

  // Validate product form
  validateProductForm(): boolean {
    this.productFormErrors = {};

    if (!this.productForm.name.trim()) {
      this.productFormErrors['name'] = 'Product name is required';
    }

    if (!this.productForm.description.trim()) {
      this.productFormErrors['description'] = 'Description is required';
    }

    if (this.productForm.price <= 0) {
      this.productFormErrors['price'] = 'Price must be greater than 0';
    }

    if (!this.productForm.category.trim()) {
      this.productFormErrors['category'] = 'Category is required';
    }

    if (!this.productForm.sku.trim()) {
      this.productFormErrors['sku'] = 'SKU is required';
    }

    if (this.productForm.inventory < 0) {
      this.productFormErrors['inventory'] = 'Inventory cannot be negative';
    }

    if (this.productForm.images.length === 0) {
      this.productFormErrors['images'] = 'At least one image is required';
    }

    return Object.keys(this.productFormErrors).length === 0;
  }

  // Validate category form
  validateCategoryForm(): boolean {
    this.categoryFormErrors = {};

    if (!this.categoryForm.name.trim()) {
      this.categoryFormErrors['name'] = 'Category name is required';
    }

    if (!this.categoryForm.description.trim()) {
      this.categoryFormErrors['description'] = 'Description is required';
    }

    return Object.keys(this.categoryFormErrors).length === 0;
  }

  // Add product
  addProduct(): void {
    if (!this.validateProductForm()) {
      return;
    }

    const productData = {
      name: this.productForm.name,
      description: this.productForm.description,
      price: this.productForm.price,
      category: this.productForm.category,
      sku: this.productForm.sku,
      inventory: this.productForm.inventory,
      seo: {
        slug: this.productForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      },
      images: this.productForm.images,
      image: this.productForm.images[0] || '',
      oldPrice: `$${this.productForm.price}`,
      newPrice: `$${this.productForm.price}`,
      rating: 4,
      badge: null
    };

    console.log('Creating product with data:', productData);
    
    this.productService.create(productData).subscribe({
      next: (product) => {
        console.log('Product created successfully:', product);
        this.productFormSuccess = true;
        // Show success message for 3 seconds then reset
        setTimeout(() => {
          this.resetProductForm();
        }, 3000);
      },
      error: (err) => {
        console.error('Error creating product:', err);
        console.error('Error details:', err.error);
        this.productFormErrors['general'] = 'Failed to create product. Please check the console for details.';
      }
    });
  }

  // Add category
  addCategory(): void {
    if (!this.validateCategoryForm()) {
      return;
    }

    const categoryData = {
      name: this.categoryForm.name,
      description: this.categoryForm.description,
      image: this.categoryForm.image || '',
      slug: this.categoryForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    };

    console.log('Creating category with data:', categoryData);
    
    this.categoryService.create(categoryData).subscribe({
      next: (category) => {
        console.log('Category created successfully:', category);
        this.categoryFormSuccess = true;
        // Show success message for 3 seconds then reset
        setTimeout(() => {
          this.resetCategoryForm();
        }, 3000);
      },
      error: (err) => {
        console.error('Error creating category:', err);
        console.error('Error details:', err.error);
        this.categoryFormErrors['general'] = 'Failed to create category. Please check the console for details.';
      }
    });
  }

  // Handle image upload (simple text input for now)
  addImage(): void {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      this.productForm.images.push(imageUrl);
    }
  }

  // Load categories for dropdown
  loadCategories(): void {
    console.log('Loading categories...');
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        console.log('Categories loaded successfully:', categories);
        this.categories = categories;
        console.log('Categories array length:', this.categories.length);
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
      }
    });
  }

  // Handle file upload for product images with compression
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Compress and convert to base64
      this.compressImage(file, 800, 0.7, (base64Image: string) => {
        this.productForm.images.push(base64Image);
      });
    }
  }

  // Compress image using canvas
  private compressImage(file: File, maxWidth: number, quality: number, callback: (base64: string) => void): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Convert to base64 with compression
          const base64 = canvas.toDataURL('image/jpeg', quality);
          callback(base64);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Remove image from product form
  removeImage(index: number): void {
    this.productForm.images.splice(index, 1);
  }
}
