import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, throwError, timeout } from 'rxjs';
import { tap } from 'rxjs/operators'; // ✅ ensure tap is imported
import { environment } from '../environments/environment';
import { User } from '../models/user.model';
import { AuthResponse } from '../models/authResponse.model';
import { TimeoutError } from 'rxjs';
import { finalize } from 'rxjs/operators';
export interface LoginError {
  message: string;
  field?: 'email' | 'password' | 'both';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/auth`;
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  currentUser = signal<User | null>(this.loadUser());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  signup(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) {
    const payload = { ...data, role: 'customer', isConfirmed: false };
    return this.http
      .post(`${this.api}/signup`, payload)
      .pipe(catchError((err) => throwError(() => err)));
  }

  signin(data: { email: string; password: string }, rememberMe = false): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.api}/signin`, data).pipe(
      timeout(this.REQUEST_TIMEOUT),
      tap((res) => this.saveSession(res, rememberMe)),
      catchError((err) => {
        let mapped: LoginError = { message: 'Unable to sign in. Please try again.', field: 'both' };
        if (err.status === 401) mapped.message = 'The email or password you entered is incorrect.';
        if (err.status === 403) mapped.message = 'Please verify your email first.';
        if (err.status === 0) mapped.message = 'Network error. Check your internet.';
        return throwError(() => mapped);
      }),
      finalize(() => console.log('Signin attempt finished')), // always runs
    );
  }

  verifyEmail(token: string) {
    return this.http
      .get(`${this.api}/verify-email/${encodeURIComponent(token)}`)
      .pipe(catchError((err) => throwError(() => err)));
  }

  forgotPassword(email: string) {
    return this.http
      .post(`${this.api}/forgot-password`, { email })
      .pipe(catchError((err) => throwError(() => err)));
  }

  resetPasswordViaToken(id: string, token: string, newPassword: string) {
    return this.http
      .post(`${this.api}/reset-password/${id}/${encodeURIComponent(token)}`, { newPassword })
      .pipe(catchError((err) => throwError(() => err)));
  }

  resetPassword(data: { oldPassword: string; newPassword: string }) {
    return this.http
      .put(`${this.api}/reset-password`, data)
      .pipe(catchError((err) => throwError(() => err)));
  }

  signout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/signin']);
  }

  isLoggedIn(): boolean {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isCustomer(): boolean {
    return this.currentUser()?.role === 'customer';
  }

  private saveSession(res: AuthResponse, rememberMe: boolean) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', res.token);
    storage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private loadUser(): User | null {
    const raw = localStorage.getItem('user') ?? sessionStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  }

  // auth.service.ts
  private mapLoginError(err: any): LoginError {
    // Default fallback
    const defaultError: LoginError = {
      message: 'Unable to sign in. Please try again.',
    };

    // Timeout error
    if (err instanceof TimeoutError) {
      return { message: 'Request timed out. Please try again.' };
    }

    // If it's an HttpErrorResponse from Angular
    const status = err?.status;
    const payload = err?.error;

    // When backend returns JSON: { message: "...", ... }
    const serverMessage =
      payload && typeof payload === 'object'
        ? payload.message
        : typeof payload === 'string'
          ? payload
          : undefined;

    if (status === 401) {
      return {
        message: serverMessage || 'The email or password you entered is incorrect.',
        field: 'both',
      };
    }

    if (status === 403 || (serverMessage && serverMessage.toLowerCase().includes('verify'))) {
      return {
        message: 'You need to confirm your email first. Check your inbox.',
      };
    }

    if (status === 0) {
      // network failure (CORS, offline)
      return { message: 'Network error. Please check your internet.' };
    }

    // fallback to server's message if present
    if (serverMessage) {
      return { message: serverMessage };
    }

    return defaultError;
  }
}
