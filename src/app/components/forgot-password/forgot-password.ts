import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

type PageState = 'form' | 'loading' | 'sent';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.scss'],
})
export class ForgotPassword {
  form: FormGroup;
  state: PageState = 'form';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.state = 'loading';
    this.errorMessage = '';

    this.authService.forgotPassword(this.form.value.email).subscribe({
      next: () => {
        this.state = 'sent';
      },
      error: (err) => {
        this.state = 'form';
        this.errorMessage = err?.error?.message ?? 'Something went wrong. Please try again.';
      },
    });
  }
}
