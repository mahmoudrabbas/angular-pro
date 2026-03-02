import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../models/user.model';
import { AuthResponse } from '../models/authResponse.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/auth`;

  currentUser = signal<User | null>(this.loadUser());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  /**
   * Registers a new user. The backend does NOT return a session token here —
   * the user must confirm their email before they can sign in.
   */
  signup(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) {
    const payload = {
      ...data,
      role: 'customer',
      isConfirmed: false,
    };
    return this.http.post(`${this.api}/signup`, payload);
  }

  signin(data: { email: string; password: string }) {
    return this.http
      .post<AuthResponse>(`${this.api}/signin`, data)
      .pipe(tap((res) => this.saveSession(res)));
  }

  /**
   * Called by the EmailVerified component with the JWT token from the email link.
   */
  verifyEmail(token: string) {
    return this.http.get(`${this.api}/verify-email/${encodeURIComponent(token)}`);
  }

  resetPassword(data: { oldPassword: string; newPassword: string }) {
    return this.http.put(`${this.api}/reset-password`, data);
  }

  signout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/signin']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  isCustomer(): boolean {
    return this.currentUser()?.role === 'customer';
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private loadUser(): User | null {
    const u = localStorage.getItem('user');
    return u ? (JSON.parse(u) as User) : null;
  }
}
