import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid py-5">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-lg-6 text-center">
            <div class="bg-light rounded p-5">
              <div class="mb-4">
                <div
                  class="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10"
                  style="width: 100px; height: 100px"
                >
                  <i class="fas fa-check-circle fa-4x text-success"></i>
                </div>
              </div>

              <h2 class="mb-3">Order Confirmed!</h2>

              @if (orderNumber) {
                <p class="text-muted mb-2">Your order number is:</p>
                <h4 class="text-primary mb-4">{{ orderNumber }}</h4>
              }

              @if (paymentPending) {
                <div class="alert alert-warning mb-4">
                  <i class="fas fa-clock me-2"></i>
                  Payment is pending. Please complete payment to process your order.
                </div>
              } @else {
                <p class="text-muted mb-4">Thank you for your purchase!</p>
              }

              <div class="d-flex flex-column gap-3">
                <a routerLink="/orders" class="btn btn-primary rounded-pill py-2 px-4">
                  <i class="fas fa-box me-2"></i>View My Orders
                </a>
                <a routerLink="/product" class="btn btn-outline-secondary rounded-pill py-2 px-4">
                  <i class="fas fa-arrow-left me-2"></i>Continue Shopping
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class PaymentSuccess implements OnInit {
  orderNumber: string | null = null;
  paymentPending = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.orderNumber = params['order'] || params['orderNumber'] || null;
      this.paymentPending = params['paymentPending'] === 'true';
    });
  }
}
