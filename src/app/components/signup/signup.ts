import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss'],
})
export class Signup {
  signupForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        address: [''],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        agreeTerms: [false, [Validators.requiredTrue]],
      },
      { validators: passwordMatchValidator },
    );
  }

  get f() {
    return this.signupForm.controls;
  }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { name, email, password, phone, address } = this.signupForm.value;

    this.authService.signup({ name, email, password, phone, address }).subscribe({
      next: () => {
        this.loading = false;
        // Redirect to check-email page, passing email for display
        this.router.navigate(['/check-email'], { queryParams: { email } });
      },
      error: (err) => {
        this.loading = false;
        const serverMsg = err?.error?.message;

        // Check for the specific backend error message
        if (serverMsg === 'Email already exists') {
          this.errorMessage =
            'An account with this email address already exists. Please log in or use a different email to register.';
        } else {
          // Fallback for other errors (validation, server down, etc.)
          this.errorMessage = serverMsg || 'An unexpected error occurred. Please try again later.';
        }
        this.cd.detectChanges();
      },
    });
  }
}
