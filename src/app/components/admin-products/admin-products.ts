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
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-products.html',
  styleUrls: ['./admin-products.scss'],
})
export class AdminProducts implements OnInit, OnDestroy {
  private api = `${environment.apiUrl}/api/products`;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ── List state ──────────────────────────────────────────────────────────────
  products: any[] = [];
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  // ── Pagination ──────────────────────────────────────────────────────────────
  currentPage = 1;
  totalPages = 1;
  totalProducts = 0;
  limit = 10;
  searchQuery = '';

  // ── Add / Edit modal ────────────────────────────────────────────────────────
  showFormModal = false;
  isEditing = false;
  selectedProduct: any = null;
  modalLoading = false;
  modalError: string | null = null;
  imageInputVal = '';
  productForm!: FormGroup;

  // ── Delete modal ────────────────────────────────────────────────────────────
  showDeleteModal = false;
  deleteTarget: any = null;
  deleteLoading = false;
  deleteError: string | null = null;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.buildForm();
    this.setupSearch();
    this.loadProducts();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  private buildForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      sku: ['', Validators.required],
      inventory: [0, [Validators.required, Validators.min(0)]],
      images: [[] as string[]],
    });
  }

  // ── Search debounce ─────────────────────────────────────────────────────────
  private setupSearch() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery = q;
        this.currentPage = 1;
        this.loadProducts();
      });
  }

  onSearch(val: string) {
    this.searchSubject.next(val);
  }

  // ── Load ────────────────────────────────────────────────────────────────────
  loadProducts() {
    this.loading = true;
    this.error = null;
    let params = new HttpParams().set('page', this.currentPage).set('limit', this.limit);
    if (this.searchQuery) params = params.set('search', this.searchQuery);

    this.http
      .get<any>(this.api, { params })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.products = res.products || [];
          this.totalProducts = res.total || 0;
          this.totalPages = res.pages || 1;
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load products.';
          this.loading = false;
        },
      });
  }

  // ── Pagination ──────────────────────────────────────────────────────────────
  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.loadProducts();
  }

  get pages(): number[] {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, this.currentPage - delta);
      i <= Math.min(this.totalPages, this.currentPage + delta);
      i++
    )
      range.push(i);
    return range;
  }

  // ── Open Add modal ──────────────────────────────────────────────────────────
  openAdd() {
    this.isEditing = false;
    this.selectedProduct = null;
    this.productForm.reset({ price: 0, inventory: 0, images: [] });
    this.imageInputVal = '';
    this.modalError = null;
    this.showFormModal = true;
  }

  // ── Open Edit modal ─────────────────────────────────────────────────────────
  openEdit(p: any) {
    this.isEditing = true;
    this.selectedProduct = p;
    this.modalError = null;
    const imgs = (p.images || []).map((i: any) => i.url || i);
    this.productForm.patchValue({
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category?.name || p.category || '',
      sku: p.sku,
      inventory: p.inventory?.quantity ?? p.inventory ?? 0,
      images: imgs,
    });
    this.imageInputVal = '';
    this.showFormModal = true;
  }

  closeFormModal() {
    this.showFormModal = false;
    this.modalError = null;
  }

  // ── Image helpers ───────────────────────────────────────────────────────────
  get currentImages(): string[] {
    return this.productForm.get('images')?.value || [];
  }

  addImage() {
    const url = this.imageInputVal.trim();
    if (!url) return;
    this.productForm.patchValue({ images: [...this.currentImages, url] });
    this.imageInputVal = '';
  }

  removeImage(i: number) {
    const imgs = [...this.currentImages];
    imgs.splice(i, 1);
    this.productForm.patchValue({ images: imgs });
  }

  // ── Submit (create or update) ───────────────────────────────────────────────
  submitForm() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    this.modalLoading = true;
    this.modalError = null;
    const val = this.productForm.value;
    const payload = {
      name: val.name,
      description: val.description,
      price: val.price,
      category: val.category,
      sku: val.sku,
      inventory: val.inventory,
      images: val.images,
      seo: {
        slug: val.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
      },
    };

    const req$ = this.isEditing
      ? this.http.put<any>(`${this.api}/${this.selectedProduct._id}`, payload)
      : this.http.post<any>(this.api, payload);

    req$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.modalLoading = false;
        this.closeFormModal();
        this.showSuccess(this.isEditing ? 'Product updated.' : 'Product created.');
        this.loadProducts();
      },
      error: (err) => {
        this.modalError = err?.error?.message || 'Operation failed.';
        this.modalLoading = false;
      },
    });
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  openDelete(p: any) {
    this.deleteTarget = p;
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
      .delete<any>(`${this.api}/${this.deleteTarget._id}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.deleteLoading = false;
          this.closeDelete();
          this.showSuccess('Product deleted.');
          if (this.products.length === 1 && this.currentPage > 1)
            this.goToPage(this.currentPage - 1);
          else this.loadProducts();
        },
        error: (err) => {
          this.deleteError = err?.error?.message || 'Delete failed.';
          this.deleteLoading = false;
        },
      });
  }

  // ── Utilities ───────────────────────────────────────────────────────────────
  getProductImage(p: any): string {
    if (p.images?.length) return p.images[0].url || p.images[0];
    return 'assets/img/product-1.png';
  }

  getStockClass(qty: number): string {
    if (qty === 0) return 'stock-out';
    if (qty <= 5) return 'stock-low';
    return 'stock-ok';
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = null), 3500);
  }

  trackById(_: number, item: any) {
    return item._id;
  }

  field(name: string) {
    return this.productForm.get(name);
  }
  invalid(name: string) {
    const f = this.field(name);
    return f?.invalid && f?.touched;
  }
}
