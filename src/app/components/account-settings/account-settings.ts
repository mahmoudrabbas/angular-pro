import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { environment } from '../../environments/environment';
import { CurrentUserService } from '../../services/current-user.service';

export interface UserProfile {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  bio: string;
  profilePicture: { url: string; alt: string };
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.css',
})
export class AccountSettings implements OnInit {
  private currentUserService = inject(CurrentUserService);
  private http = inject(HttpClient);
  private router = inject(Router);

  isSaving = signal(false);
  isLoading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  activeTab = signal<'profile' | 'password'>('profile');

  profile = signal<UserProfile>({
    firstName: '',
    lastName: '',
    displayName: '',
    phone: '',
    bio: '',
    profilePicture: { url: '', alt: '' },
  });

  memberSince = signal('');
  userEmail = signal('');

  // Phone validation state
  phoneError = signal('');

  passwordForm = signal({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  showCurrentPw = signal(false);
  showNewPw = signal(false);
  showConfirmPw = signal(false);

  // Egyptian phone: 010, 011, 012, 015 followed by 8 digits = 11 digits total
  private readonly egyptianPhoneRegex = /^01[0125][0-9]{8}$/;
  ngOnInit() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const storedUser = this.currentUserService.user();
    this.userEmail.set(storedUser?.email ?? '');
    if (storedUser?.['createdAt']) {
      const date = new Date(storedUser['createdAt']);
      this.memberSince.set(date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }));
    }

    this.isLoading.set(true);
    this.http
      .get<any>(`${environment.apiUrl}/api/profile`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (res) => {
          if (res.success && res.profile) {
            const p = res.profile;

            this.profile.set({
              firstName: p.firstName ?? '',
              lastName: p.lastName ?? '',
              displayName: p.displayName ?? '',
              phone: p.phone ?? '',
              bio: p.bio ?? '',
              profilePicture: p.profilePicture ?? { url: '', alt: '' },
            });

            this.currentUserService.updateUser({
              name: p.displayName || `${p.firstName} ${p.lastName}`.trim(),
            });
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          if (err.status === 401) this.router.navigate(['/login']);
          this.isLoading.set(false);
        },
      });
  }
  setTab(tab: 'profile' | 'password') {
    this.activeTab.set(tab);
    this.successMsg.set('');
    this.errorMsg.set('');
  }

  updateProfile(field: string, value: string) {
    this.profile.update((p) => ({ ...p, [field]: value }));

    // Live phone validation on every keystroke
    if (field === 'phone') {
      this.validatePhone(value);
    }
  }

  // Validates and sets phoneError signal
  private validatePhone(value: string): boolean {
    if (!value) {
      this.phoneError.set('');
      return true;
    }

    const cleaned = value.replace(/[\s\-]/g, '');
    if (!this.egyptianPhoneRegex.test(cleaned)) {
      this.phoneError.set('Enter a valid Egyptian number (010, 011, 012, or 015 + 8 digits)');
      return false;
    }
    this.phoneError.set('');
    return true;
  }

  updatePassword(field: string, value: string) {
    this.passwordForm.update((f) => ({ ...f, [field]: value }));
  }

  getInitials(): string {
    const first = this.profile().firstName.trim();
    const last = this.profile().lastName.trim();
    if (first && last) return (first[0] + last[0]).toUpperCase();
    if (first) return first.slice(0, 2).toUpperCase();
    return 'ME';
  }

  getFullName(): string {
    const p = this.profile();
    const full = `${p.firstName} ${p.lastName}`.trim();
    return full || p.displayName || 'Your Name';
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  saveProfile() {
    const p = this.profile();

    if (!p.firstName) {
      this.errorMsg.set('First name is required.');
      return;
    }

    if (p.phone && !this.validatePhone(p.phone)) {
      this.errorMsg.set('Please fix the phone number before saving.');
      return;
    }

    this.isSaving.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    const cleanedPhone = p.phone.replace(/[\s\-]/g, '');

    const body = {
      firstName: p.firstName,
      lastName: p.lastName,
      displayName: p.displayName || `${p.firstName} ${p.lastName}`.trim(),
      phone: cleanedPhone,
      bio: p.bio,
    };

    this.http
      .put<any>(`${environment.apiUrl}/api/profile`, body, {
        headers: this.getAuthHeaders(),
      })
      .subscribe({
        next: (res) => {
          if (res.success && res.profile) {
            const p = res.profile;
            this.currentUserService.updateUser({
              name: p.displayName || `${p.firstName} ${p.lastName}`.trim(),
            });
          }
          this.successMsg.set('Profile updated successfully!');
          this.isSaving.set(false);
        },
        error: (err) => {
          this.errorMsg.set(
            err.status === 401
              ? 'Session expired. Please log in again.'
              : err.error?.message || 'Failed to update profile. Please try again.',
          );
          if (err.status === 401) this.router.navigate(['/login']);
          this.isSaving.set(false);
        },
      });
  }

  savePassword() {
    const f = this.passwordForm();
    this.errorMsg.set('');
    this.successMsg.set('');

    if (!f.currentPassword || !f.newPassword || !f.confirmPassword) {
      this.errorMsg.set('All password fields are required.');
      return;
    }
    if (f.newPassword.length < 6) {
      this.errorMsg.set('New password must be at least 6 characters.');
      return;
    }
    if (f.newPassword !== f.confirmPassword) {
      this.errorMsg.set('New passwords do not match.');
      return;
    }

    this.isSaving.set(true);

    this.http
      .put<any>(
        `${environment.apiUrl}/auth/reset-password`,
        {
          oldPassword: f.currentPassword,
          newPassword: f.newPassword,
        },
        { headers: this.getAuthHeaders() },
      )
      .subscribe({
        next: () => {
          this.successMsg.set('Password changed successfully!');
          this.passwordForm.set({ currentPassword: '', newPassword: '', confirmPassword: '' });
          this.isSaving.set(false);
        },
        error: (err) => {
          this.errorMsg.set(
            err.status === 400
              ? 'Current password is incorrect.'
              : err.status === 401
                ? 'Session expired. Please log in again.'
                : 'Failed to change password. Try again.',
          );
          if (err.status === 401) this.router.navigate(['/login']);
          this.isSaving.set(false);
        },
      });
  }

  getPasswordStrength(): { label: string; level: number; color: string } {
    const pw = this.passwordForm().newPassword;
    if (!pw) return { label: '', level: 0, color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { label: 'Weak', level: 1, color: '#e8302a' };
    if (score <= 3) return { label: 'Medium', level: 2, color: '#f5a623' };
    return { label: 'Strong', level: 3, color: '#28a745' };
  }
}
