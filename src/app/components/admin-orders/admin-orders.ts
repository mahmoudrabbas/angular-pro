import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  orders: any[] = [];
  filteredOrders: any[] = [];
  loading = false;
  error: string | null = null;
  successMsg: string | null = null;

  currentPage = 1;
  totalPages = 1;
  totalOrders = 0;
  limit = 10;

  searchQuery = '';
  statusFilter = '';
  statusOptions = STATUS_OPTIONS;

  showDetail = false;
  detailOrder: any = null;

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

  private setupSearch() {
    this.searchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((q) => {
        this.searchQuery = q;
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  onSearch(val: string) {
    this.searchSubject.next(val);
  }

  onStatusFilter(val: string) {
    this.statusFilter = val;
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters() {
    let result = [...this.orders];

    if (this.statusFilter) {
      result = result.filter((o) => o.orderStatus === this.statusFilter);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          (o._id || '').toLowerCase().includes(q) ||
          (o.user?.name || '').toLowerCase().includes(q) ||
          (o.user?.email || '').toLowerCase().includes(q) ||
          (o.orderNumber || '').toLowerCase().includes(q),
      );
    }

    this.totalOrders = result.length;
    this.totalPages = Math.ceil(result.length / this.limit) || 1;

    const start = (this.currentPage - 1) * this.limit;
    this.filteredOrders = result.slice(start, start + this.limit);
  }

  loadOrders() {
    this.loading = true;
    this.error = null;

    this.http
      .get<any>(this.api, this.getAuthHeaders())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.orders = res.data || [];
          this.loading = false;
          this.applyFilters();
        },
        error: (err) => {
          this.error = err?.error?.message || 'Failed to load orders.';
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

  openDetail(o: any) {
    this.detailOrder = o;
    this.showDetail = true;
  }

  closeDetail() {
    this.showDetail = false;
    this.detailOrder = null;
  }

  openStatus(o: any) {
    this.statusTarget = o;
    this.newStatus = o.orderStatus || 'pending';
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
      .put<any>(
        `${this.api}/${this.statusTarget._id}/status`,
        { status: this.newStatus },
        this.getAuthHeaders(),
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.statusLoading = false;

          const idx = this.orders.findIndex((o) => o._id === this.statusTarget._id);
          if (idx !== -1) this.orders[idx].orderStatus = this.newStatus;
          if (this.detailOrder?._id === this.statusTarget._id)
            this.detailOrder.orderStatus = this.newStatus;

          this.applyFilters();
          this.closeStatus();
          this.showSuccess('Order status updated.');
        },
        error: (err) => {
          this.statusError = err?.error?.message || 'Update failed.';
          this.statusLoading = false;
        },
      });
  }

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
