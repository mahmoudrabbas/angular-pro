import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-payment-failed',
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
                  class="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10"
                  style="width: 100px; height: 100px"
                >
                  <i class="fas fa-exclamation-triangle fa-4x text-danger"></i>
                </div>
              </div>

              <h2 class="mb-3">Payment Failed</h2>
              <p class="text-muted mb-4">
                Something went wrong while processing your payment. Please try again
                or contact support if the issue persists.
              </p>

              <div class="d-flex flex-column gap-3">
                <a routerLink="/cart" class="btn btn-primary rounded-pill py-2 px-4">
                  <i class="fas fa-redo me-2"></i>Try Again
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
export class PaymentFailed { }
