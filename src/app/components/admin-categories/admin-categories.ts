import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-categories.html',
  styleUrls: ['./admin-categories.scss'],
})
export class AdminCategories implements OnInit, OnDestroy {
  private api = `${environment.apiUrl}/api/categories`;
  private destroy$ = new Subject<void>();

  categories: any[] = [];
  filteredCategories: any[] = [];
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  searchQuery = '';

  currentPage = 1;
  totalPages = 1;
  totalCategories = 0;
  limit = 8;

  showFormModal = false;
  isEditing = false;
  selectedCategory: any = null;
  modalLoading = false;
  modalError: string | null = null;
  categoryForm!: FormGroup;

  showDeleteModal = false;
  deleteTarget: any = null;
  deleteLoading = false;
  deleteError: string | null = null;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
  ) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  ngOnInit() {
    this.buildForm();
    this.loadCategories();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.required],
    });
  }

  onSearch(val: string) {
    this.searchQuery = val;
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters() {
    let result = [...this.categories];

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q),
      );
    }

    this.totalCategories = result.length;
    this.totalPages = Math.ceil(result.length / this.limit) || 1;
    const start = (this.currentPage - 1) * this.limit;
    this.filteredCategories = result.slice(start, start + this.limit);
  }

  loadCategories() {
    this.loading = true;
    this.error = null;

    this.http
      .get<any>(this.api)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.categories = res.categories || [];
          this.loading = false;
          this.applyFilters();
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load categories.';
          this.loading = false;
        },
      });
  }

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.applyFilters();
  }

  get pages(): number[] {
    const range: number[] = [];
    for (
      let i = Math.max(1, this.currentPage - 2);
      i <= Math.min(this.totalPages, this.currentPage + 2);
      i++
    )
      range.push(i);
    return range;
  }

  openAdd() {
    this.isEditing = false;
    this.selectedCategory = null;
    this.categoryForm.reset();
    this.modalError = null;
    this.showFormModal = true;
  }

  openEdit(c: any) {
    this.isEditing = true;
    this.selectedCategory = c;
    this.categoryForm.patchValue({
      name: c.name,
      description: c.description || '',
    });
    this.modalError = null;
    this.showFormModal = true;
  }

  closeFormModal() {
    this.showFormModal = false;
    this.modalError = null;
  }

  submitForm() {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    this.modalLoading = true;
    this.modalError = null;

    const val = this.categoryForm.value;
    const payload = {
      name: val.name,
      description: val.description,
      slug: val.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    };

    const req$ = this.isEditing
      ? this.http.put<any>(
          `${this.api}/${this.selectedCategory._id}`,
          payload,
          this.getAuthHeaders(),
        )
      : this.http.post<any>(this.api, payload, this.getAuthHeaders());

    req$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.modalLoading = false;
        this.closeFormModal();
        this.showSuccess(this.isEditing ? 'Category updated.' : 'Category created.');
        this.loadCategories();
      },
      error: (err) => {
        this.modalError = err?.error?.message || 'Operation failed.';
        this.modalLoading = false;
      },
    });
  }

  openDelete(c: any) {
    this.deleteTarget = c;
    this.deleteError = null;
    this.showDeleteModal = true;
  }

  closeDelete() {
    this.showDeleteModal = false;
    this.deleteTarget = null;
  }

  confirmDelete() {
    if (!this.deleteTarget) return;
    this.deleteLoading = true;
    this.deleteError = null;

    this.http
      .delete<any>(`${this.api}/${this.deleteTarget._id}`, this.getAuthHeaders())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.deleteLoading = false;
          this.closeDelete();
          this.showSuccess('Category deleted.');
          this.loadCategories();
        },
        error: (err) => {
          this.deleteError = err?.error?.message || 'Delete failed.';
          this.deleteLoading = false;
        },
      });
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = null), 3500);
  }

  trackById(_: number, item: any) {
    return item._id;
  }

  field(name: string) {
    return this.categoryForm.get(name);
  }

  invalid(name: string) {
    const f = this.field(name);
    return f?.invalid && f?.touched;
  }
}
