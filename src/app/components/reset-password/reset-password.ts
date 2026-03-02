import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('newPassword');
  const confirm = control.get('confirmPassword');
  if (pw && confirm && pw.value !== confirm.value) {
    return { passwordMismatch: true };
  }
  return null;
}

type PageState = 'form' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.scss'],
})
export class ResetPassword implements OnInit {
  form: FormGroup;
  state: PageState = 'form';
  errorMessage = '';
  showPassword = false;
  showConfirm = false;

  private userId = '';
  private token = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {
    this.form = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator },
    );
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') ?? '';
    this.token = this.route.snapshot.paramMap.get('token') ?? '';

    if (!this.userId || !this.token) {
      this.state = 'error';
      this.errorMessage = 'Invalid or missing reset link parameters.';
    }
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

    this.authService
      .resetPasswordViaToken(this.userId, this.token, this.form.value.newPassword)
      .subscribe({
        next: () => {
          this.state = 'success';
          setTimeout(() => this.router.navigate(['/signin']), 3000);
        },
        error: (err) => {
          this.state = 'error';
          this.errorMessage = err?.error?.message ?? 'Reset failed. The link may have expired.';
        },
      });
  }

  tryAgain() {
    this.state = 'form';
    this.errorMessage = '';
    this.form.reset();
  }
}
