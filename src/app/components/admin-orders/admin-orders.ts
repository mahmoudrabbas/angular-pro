import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-orders.html',
  styleUrls: ['./admin-orders.scss'],
})
export class AdminOrders implements OnInit, OnDestroy {
  private api = `${environment.apiUrl}/api/orders`;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // ── List state ──────────────────────────────────────────────────────────────
  orders: any[] = [];
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  // ── Pagination ──────────────────────────────────────────────────────────────
  currentPage = 1;
  totalPages = 1;
  totalOrders = 0;
  limit = 10;

  // ── Filters ─────────────────────────────────────────────────────────────────
  searchQuery = '';
  statusFilter = '';
  statusOptions = STATUS_OPTIONS;

  // ── Detail modal ────────────────────────────────────────────────────────────
  showDetail = false;
  detailOrder: any = null;

  // ── Status update modal ─────────────────────────────────────────────────────
  showStatusModal = false;
  statusTarget: any = null;
  newStatus = '';
  statusLoading = false;
  statusError: string | null = null;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  ngOnInit() {
    this.setupSearch();
    this.loadOrders();
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Search ──────────────────────────────────────────────────────────────────
  private setupSearch() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery = q;
        this.currentPage = 1;
        this.loadOrders();
      });
  }
  onSearch(val: string) {
    this.searchSubject.next(val);
  }
  onStatusFilter(val: string) {
    this.statusFilter = val;
    this.currentPage = 1;
    this.loadOrders();
  }

  // ── Load ────────────────────────────────────────────────────────────────────
  loadOrders() {
    this.loading = true;
    this.error = null;
    let params = new HttpParams().set('page', this.currentPage).set('limit', this.limit);
    if (this.statusFilter) params = params.set('status', this.statusFilter);

    this.http
      .get<any>(this.api, { params, ...this.getAuthHeaders() })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.orders = res.orders || [];
          this.totalOrders = res.total || res.count || this.orders.length;
          this.totalPages = res.pages || 1;
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load orders.';
          this.loading = false;
        },
      });
  }

  // ── Pagination ──────────────────────────────────────────────────────────────
  goToPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.loadOrders();
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

  // ── Detail modal ────────────────────────────────────────────────────────────
  openDetail(o: any) {
    this.detailOrder = o;
    this.showDetail = true;
  }
  closeDetail() {
    this.showDetail = false;
    this.detailOrder = null;
  }

  // ── Status modal ────────────────────────────────────────────────────────────
  openStatus(o: any) {
    this.statusTarget = o;
    this.newStatus = o.status || 'pending';
    this.statusError = null;
    this.showStatusModal = true;
  }
  closeStatus() {
    this.showStatusModal = false;
    this.statusTarget = null;
  }

  updateStatus() {
    if (!this.statusTarget || !this.newStatus) return;
    this.statusLoading = true;
    this.statusError = null;
    this.http
      .patch<any>(
        `${this.api}/${this.statusTarget._id}/status`,
        { status: this.newStatus },
        this.getAuthHeaders(),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.statusLoading = false;
          // update inline
          const idx = this.orders.findIndex((o) => o._id === this.statusTarget._id);
          if (idx !== -1) this.orders[idx].status = this.newStatus;
          if (this.detailOrder?._id === this.statusTarget._id)
            this.detailOrder.status = this.newStatus;
          this.closeStatus();
          this.showSuccess('Order status updated.');
        },
        error: (err) => {
          this.statusError = err?.error?.message || 'Update failed.';
          this.statusLoading = false;
        },
      });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  statusClass(s: string = ''): string {
    const map: Record<string, string> = {
      pending: 'st-pending',
      processing: 'st-processing',
      shipped: 'st-shipped',
      delivered: 'st-delivered',
      cancelled: 'st-cancelled',
      canceled: 'st-cancelled',
    };
    return map[s.toLowerCase()] || 'st-pending';
  }

  formatDate(d: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  getInitials(name: string = ''): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join('');
  }

  private showSuccess(msg: string) {
    this.successMsg = msg;
    setTimeout(() => (this.successMsg = null), 3500);
  }

  trackById(_: number, item: any) {
    return item._id;
  }
}
