import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './category-form.html',
  styleUrls: ['./category-form.scss']
})
export class CategoryFormComponent implements OnInit {
  categoryForm: FormGroup;
  isEditing = false;
  categoryId: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]]
    });
  }

  ngOnInit(): void {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (this.categoryId) {
      this.isEditing = true;
      this.loadCategory();
    }
  }

  loadCategory(): void {
    this.categoryService.getById(this.categoryId!).subscribe({
      next: (category) => {
        if (category) {
          this.categoryForm.patchValue({
            name: category.name,
            description: category.description,
            slug: category.slug
          });
        }
      },
      error: (err) => {
        console.error('Error loading category:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.isSubmitting = true;
      const categoryData = this.categoryForm.value;
      
      if (this.isEditing && this.categoryId) {
        this.categoryService.update(this.categoryId, categoryData).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.router.navigate(['/admin/categories']);
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Error updating category:', err);
          }
        });
      } else {
        this.categoryService.create(categoryData).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.router.navigate(['/admin/categories']);
          },
          error: (err) => {
            this.isSubmitting = false;
            console.error('Error creating category:', err);
          }
        });
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/categories']);
  }

  generateSlug(): void {
    const name = this.categoryForm.get('name')?.value;
    if (name) {
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      this.categoryForm.get('slug')?.setValue(slug);
    }
  }

  addDefaultCategories(): void {
    const defaultCategories = [
      { name: 'Electronics', description: 'Electronic devices and accessories', slug: 'electronics' },
      { name: 'Clothing', description: 'Apparel and fashion items', slug: 'clothing' },
      { name: 'Home & Garden', description: 'Home improvement and gardening', slug: 'home-garden' },
      { name: 'Sports', description: 'Sports equipment and activewear', slug: 'sports' },
      { name: 'Books', description: 'Books and educational materials', slug: 'books' }
    ];

    defaultCategories.forEach((category, index) => {
      setTimeout(() => {
        this.categoryService.create(category).subscribe({
          next: (createdCategory) => {
            console.log(`Added category: ${createdCategory.name}`);
          },
          error: (err) => {
            console.error(`Error adding category ${category.name}:`, err);
          }
        });
      }, index * 500); 
    });
  }
}