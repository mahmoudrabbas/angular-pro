import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrderService, ApiOrder } from '../../services/order.service';
import { Sidebar } from '../../shared/sidebar/sidebar';
import jsPDF from 'jspdf';

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
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  errorMsg = signal('');
  activeFilter = signal('All');
  searchQuery = signal('');
  expandedId = signal<string | null>(null);

  cancellingId = signal<string | null>(null);
  cancelError = signal('');
  cancelSuccess = signal('');

  // Modal state
  showCancelModal = signal(false);
  orderToCancel = signal<Order | null>(null);

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

  // ── Cancel Modal ──
  openCancelModal(order: Order) {
    this.orderToCancel.set(order);
    this.showCancelModal.set(true);
    this.cancelError.set('');
  }

  closeCancelModal() {
    this.showCancelModal.set(false);
    this.orderToCancel.set(null);
    this.cancelError.set('');
  }

  confirmCancel() {
    const order = this.orderToCancel();
    if (!order) return;

    this.cancellingId.set(order.id);
    this.cancelError.set('');
    this.cancelSuccess.set('');

    this.orderService.cancelOrder(order.id).subscribe({
      next: () => {
        this.orders.update((orders) =>
          orders.map((o) => (o.id === order.id ? { ...o, status: 'cancelled' } : o)),
        );
        this.cancelSuccess.set(`✅ Order ${order.orderNumber} has been cancelled.`);
        this.cancellingId.set(null);
        this.closeCancelModal();
        setTimeout(() => this.cancelSuccess.set(''), 4000);
      },
      error: (err) => {
        this.cancelError.set(err.error?.message || 'Failed to cancel order. Please try again.');
        this.cancellingId.set(null);
      },
    });
  }

  goToContact() {
    this.router.navigate(['/contact']);
  }

  downloadInvoice(order: Order) {
    const doc = new jsPDF();
    const orange = [245, 166, 35] as const;
    const dark = [34, 34, 34] as const;
    const mid = [85, 85, 85] as const;
    const border = [232, 232, 232] as const;

    doc.setFillColor(...orange);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Sooq', 14, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('INVOICE', 14, 28);

    doc.setFontSize(10);
    doc.text(order.orderNumber, 196, 18, { align: 'right' });
    doc.text(order.date, 196, 26, { align: 'right' });

    doc.setTextColor(...dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Number:', 14, 54);
    doc.text('Date:', 90, 54);
    doc.text('Status:', 140, 54);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mid);
    doc.text(order.orderNumber, 14, 61);
    doc.text(order.date, 90, 61);
    doc.text(this.capitalize(order.status), 140, 61);

    doc.setDrawColor(...border);
    doc.setLineWidth(0.5);
    doc.line(14, 68, 196, 68);

    doc.setTextColor(...dark);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Shipping Address', 14, 78);
    doc.text('Payment', 120, 78);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mid);
    doc.text(order.address, 14, 86);
    doc.text(this.capitalize(order.paymentMethod), 120, 86);
    doc.text(order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid', 120, 93);

    const tableTop = 108;
    doc.setFillColor(...orange);
    doc.rect(14, tableTop - 7, 182, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Item', 18, tableTop - 0.5);
    doc.text('Qty', 130, tableTop - 0.5);
    doc.text('Unit Price', 150, tableTop - 0.5);
    doc.text('Subtotal', 178, tableTop - 0.5, { align: 'right' });

    let y = tableTop + 8;
    doc.setFont('helvetica', 'normal');

    order.items.forEach((item, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(14, y - 6, 182, 10, 'F');
      }
      doc.setTextColor(...dark);
      const name = item.name.length > 45 ? item.name.slice(0, 42) + '…' : item.name;
      doc.text(name, 18, y);
      doc.setTextColor(...mid);
      doc.text(String(item.quantity), 133, y);
      doc.text(`$${item.price.toLocaleString()}`, 153, y);
      doc.text(`$${(item.price * item.quantity).toLocaleString()}`, 196, y, { align: 'right' });
      y += 10;
    });

    y += 4;
    doc.setDrawColor(...border);
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFillColor(255, 248, 230);
    doc.rect(120, y - 6, 76, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...dark);
    doc.setFontSize(12);
    doc.text('Total:', 124, y + 2);
    doc.setTextColor(224, 148, 26);
    doc.text(`$${order.total.toLocaleString()}`, 196, y + 2, { align: 'right' });

    const pageH = doc.internal.pageSize.height;
    doc.setFillColor(...orange);
    doc.rect(0, pageH - 18, 210, 18, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for shopping with us!', 105, pageH - 8, { align: 'center' });

    doc.save(`invoice-${order.orderNumber}.pdf`);
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
      items: o.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
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
