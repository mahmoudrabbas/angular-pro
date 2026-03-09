import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, ApiOrder } from '../../services/order.service';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  items: OrderItem[];
  address: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  activeFilter = signal('All');
  searchQuery = signal('');
  expandedId = signal<string | null>(null);

  filters = ['All', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  filteredOrders = computed(() => {
    let result = this.orders();
    const filter = this.activeFilter();
    const query = this.searchQuery().toLowerCase();

    if (filter !== 'All') {
      result = result.filter((o) => o.status.toLowerCase() === filter);
    }
    if (query) {
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.items.some((i) => i.name.toLowerCase().includes(query)),
      );
    }
    return result;
  });

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading.set(true);
    this.errorMsg.set('');

    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.orders.set(res.data.map((o) => this.mapOrder(o)));
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(
          err.status === 401
            ? 'Session expired. Please log in again.'
            : 'Failed to load orders. Please try again.',
        );
        this.isLoading.set(false);
      },
    });
  }

  private mapOrder(o: ApiOrder): Order {
    return {
      id: o._id,
      orderNumber: o.orderNumber,
      date: new Date(o.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
      }),
      status: o.orderStatus,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.paymentMethod,
      total: o.totalAmount,
      items: o.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      address: `${o.shippingAddress.city}, ${o.shippingAddress.country}`,
    };
  }

  setFilter(filter: string) {
    this.activeFilter.set(filter);
  }

  toggleExpand(id: string) {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  isExpanded(id: string) {
    return this.expandedId() === id;
  }

  countByStatus(filter: string): number {
    if (filter === 'All') return this.orders().length;
    return this.orders().filter((o) => o.status.toLowerCase() === filter).length;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      pending: 'status-pending',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled',
    };
    return map[status.toLowerCase()] ?? 'status-pending';
  }

  getStatusIcon(status: string): string {
    const map: Record<string, string> = {
      pending: '🕐',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌',
    };
    return map[status.toLowerCase()] ?? '•';
  }

  getPaymentIcon(method: string): string {
    return method.toLowerCase() === 'card' ? '💳' : '💵';
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
  }

  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
