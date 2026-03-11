import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './category-list.html',
  styleUrls: ['./category-list.scss']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  error: string | null = null;

  // wow delays cycle: 0.1s, 0.3s, 0.5s, 0.7s
  wowDelays = ['0.1s', '0.3s', '0.5s', '0.7s'];

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;
    
    this.categoryService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error = 'Failed to load categories. Please try again.';
        this.loading = false;
      }
    });
  }

  addDefaultCategories(): void {
    const defaultCategories = [
      { name: 'Electronics', description: 'Electronic devices and accessories', slug: 'electronics' },
      { name: 'Clothing', description: 'Apparel and fashion items', slug: 'clothing' },
      { name: 'Home & Garden', description: 'Home improvement and gardening', slug: 'home-garden' },
      { name: 'Sports', description: 'Sports equipment and activewear', slug: 'sports' },
      { name: 'Books', description: 'Books and educational materials', slug: 'books' }
    ];

    let completed = 0;
    let errors = 0;

    defaultCategories.forEach((category, index) => {
      setTimeout(() => {
        this.categoryService.create(category).subscribe({
          next: (createdCategory) => {
            completed++;
            console.log(`Added category: ${createdCategory.name}`);
            
            if (completed === defaultCategories.length) {
              console.log(`Success! Added ${completed} default categories.`);
              this.loadCategories(); // Reload categories to show them
            }
          },
          error: (err) => {
            errors++;
            console.error(`Error adding category ${category.name}:`, err);
          }
        });
      }, index * 500); // Add with small delay to avoid conflicts
    });
  }

  getDelay(index: number): string {
    return this.wowDelays[index % this.wowDelays.length];
  }
}