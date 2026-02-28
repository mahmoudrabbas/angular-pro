import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  loginForm: FormGroup; // This is the correct form name
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get f() {
    return this.loginForm.controls; // Using loginForm here
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) { // Using loginForm here
      this.loginForm.markAllAsTouched(); // Using loginForm here
      return;
    }

    console.log('Login data:', this.loginForm.value); // Using loginForm here
    
    // TODO: Call AuthService to login
    // this.authService.login(this.loginForm.value).subscribe({
    //   next: (response) => {
    //     console.log('Login successful', response);
    //     this.router.navigate(['/products']);
    //   },
    //   error: (error) => {
    //     console.error('Login failed', error);
    //     // Handle error (show message to user)
    //   }
    // });
  }

  onForgotPassword() {
    // Navigate to forgot password page
    this.router.navigate(['/forgot-password']);
    console.log('Navigate to forgot password');
  }
}