import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { AuthService, LoginError } from '../../services/auth.service'; // 👈 Import LoginError
import { CartService } from '../../services/cart.service';
import { OnDestroy } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login implements OnDestroy {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  errorMessage = '';
  errorField: 'email' | 'password' | 'both' | undefined = undefined;
  shakeForm = false;

  private subs = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });

    // Clear server error when user starts typing
    this.subs.add(
      this.loginForm.valueChanges.subscribe(() => {
        if (this.errorMessage) this.clearError();
      }),
    );
  }

  get f() {
    return this.loginForm.controls;
  }

  isFieldError(field: 'email' | 'password'): boolean {
    return this.errorField === field || this.errorField === 'both';
  }

  clearError() {
    this.errorMessage = '';
    this.errorField = undefined;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  // login.ts
  onSubmit() {
    if (this.loading) return;

    // Mark all fields as touched so errors show
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) return;

    this.loading = true;
    this.clearError();

    const { email, password, rememberMe } = this.loginForm.value;

    this.subs.add(
      this.authService
        .signin({ email, password }, rememberMe)
        .pipe(
          finalize(() => {
            this.loading = false;
            this.cd.detectChanges(); // Force update
          }),
        )
        .subscribe({
          next: () => {
            this.cartService.mergeGuestCart();
            this.router.navigate([this.authService.isAdmin() ? '/admin' : '/']);
          },
          error: (err: LoginError) => {
            this.errorMessage = err.message;
            this.errorField = err.field;
            this.shakeForm = false;
            setTimeout(() => (this.shakeForm = true), 10);

            this.cd.detectChanges();
          },
        }),
    );
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
