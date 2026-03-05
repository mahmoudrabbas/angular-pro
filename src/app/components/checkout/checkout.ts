import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { PaymentService } from '../../services/payment.service';
import { CartItem } from '../../models/cart.model';
import { ShippingAddress } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.scss'],
})
export class Checkout implements OnInit {
  shippingForm!: FormGroup;
  paymentMethod: string = 'card';
  submitting = false;
  submitError: string | null = null;

  constructor(
    private fb: FormBuilder,
    public cartService: CartService,
    private paymentService: PaymentService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.cartService.loadCart();

    this.shippingForm = this.fb.group({
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{4,10}$/)]],
      country: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  get cartItems(): CartItem[] {
    return this.cartService.cart()?.items ?? [];
  }

  get subtotal(): number {
    return this.cartService.cartTotal();
  }

  get shipping(): number {
    return this.subtotal > 50 ? 0 : 10;
  }

  get total(): number {
    return this.subtotal + this.shipping;
  }

  selectPaymentMethod(method: string): void {
    this.paymentMethod = method;
  }

  getProductImage(item: CartItem): string {
    return item.product?.images?.length
      ? item.product.images[0]
      : 'assets/img/product-3.png';
  }

  placeOrder(): void {
    if (this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submitError = null;

    const shippingAddress: ShippingAddress = this.shippingForm.value;

    this.cartService.checkout(shippingAddress, this.paymentMethod).subscribe({
      next: (res) => {
        if (this.paymentMethod === 'card') {
          // Redirect to Stripe payment
          this.paymentService.createCheckoutSession(res.order_id).subscribe({
            next: (paymentRes) => {
              this.submitting = false;
              if (paymentRes.url) {
                window.location.href = paymentRes.url;
              } else {
                // No Stripe URL, go to success page
                this.router.navigate(['/payment/success'], {
                  queryParams: { orderNumber: res.orderNumber },
                });
              }
            },
            error: (err) => {
              this.submitting = false;
              // Order was created, payment session failed — go to success anyway
              this.router.navigate(['/payment/success'], {
                queryParams: {
                  orderNumber: res.orderNumber,
                  paymentPending: true,
                },
              });
            },
          });
        } else {
          // Cash on delivery — go directly to success page
          this.submitting = false;
          this.router.navigate(['/payment/success'], {
            queryParams: { orderNumber: res.orderNumber },
          });
        }
      },
      error: (err) => {
        this.submitting = false;
        this.submitError =
          err?.error?.message || 'Failed to place order. Please try again.';
      },
    });
  }

  // Helper for form validation display
  isFieldInvalid(field: string): boolean {
    const control = this.shippingForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(field: string): string {
    const control = this.shippingForm.get(field);
    if (control?.hasError('required')) return `${field} is required`;
    if (control?.hasError('minlength')) return `${field} is too short`;
    if (control?.hasError('pattern')) return `Invalid ${field}`;
    return '';
  }
}
