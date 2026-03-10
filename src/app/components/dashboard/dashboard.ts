import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, Sidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private orderService = inject(OrderService);

  user = JSON.parse(
    localStorage.getItem('user') ||
      sessionStorage.getItem('user') ||
      '{"name":"My Account","email":""}',
  );
  totalOrders = signal(0);
  deliveredOrders = signal(0);
  pendingOrders = signal(0);
  isLoading = signal(true);

  recentOrders = signal<any[]>([]);

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        if (res.success) {
          this.totalOrders.set(res.data.length);
          this.deliveredOrders.set(res.data.filter((o) => o.orderStatus === 'delivered').length);
          this.pendingOrders.set(
            res.data.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'processing')
              .length,
          );
          this.recentOrders.set(res.data.slice(0, 3));
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  capitalize(s: string): string {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
  }
}
