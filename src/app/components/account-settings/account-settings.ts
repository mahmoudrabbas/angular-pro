import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { environment } from '../../environments/environment';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  avatar: string;
}

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './account-settings.html',
  styleUrl: './account-settings.css',
})
export class AccountSettings implements OnInit {
  private http: HttpClient;
  constructor(http: HttpClient) {
    this.http = http;
  }

  isLoading = signal(false);
  isSaving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  activeTab = signal<'profile' | 'password' | 'notifications'>('profile');

  profile = signal<UserProfile>({
    name: '',
    email: '',
    phone: '',
    city: '',
    country: '',
    avatar: '',
  });

  passwordForm = signal({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  showCurrentPw = signal(false);
  showNewPw = signal(false);
  showConfirmPw = signal(false);

  notifications = signal({
    orderUpdates: true,
    promotions: false,
    newArrivals: true,
    priceDrops: true,
    newsletter: false,
  });

  ngOnInit() {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        this.profile.set({
          name: u.name ?? '',
          email: u.email ?? '',
          phone: u.phone ?? '',
          city: u.city ?? '',
          country: u.country ?? '',
          avatar: u.avatar ?? '',
        });
      } catch {}
    }
  }

  setTab(tab: 'profile' | 'password' | 'notifications') {
    this.activeTab.set(tab);
    this.successMsg.set('');
    this.errorMsg.set('');
  }

  updateProfile(field: string, value: string) {
    this.profile.update((p) => ({ ...p, [field]: value }));
  }

  updatePassword(field: string, value: string) {
    this.passwordForm.update((f) => ({ ...f, [field]: value }));
  }

  updateNotification(field: string, value: boolean) {
    this.notifications.update((n) => ({ ...n, [field]: value }));
  }

  getInitials(): string {
    return (
      this.profile()
        .name.split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'ME'
    );
  }

  saveProfile() {
    const p = this.profile();
    if (!p.name || !p.email) {
      this.errorMsg.set('Name and email are required.');
      return;
    }

    this.isSaving.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .put(
        `${environment.apiUrl}/api/users/profile`,
        { name: p.name, phone: p.phone, city: p.city, country: p.country },
        { headers },
      )
      .subscribe({
        next: (res: any) => {
          const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
          if (raw) {
            const u = JSON.parse(raw);
            const updated = { ...u, name: p.name, phone: p.phone };
            localStorage.setItem('user', JSON.stringify(updated));
          }
          this.successMsg.set('✅ Profile updated successfully!');
          this.isSaving.set(false);
        },
        error: () => {
          const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
          if (raw) {
            const u = JSON.parse(raw);
            localStorage.setItem('user', JSON.stringify({ ...u, ...p }));
          }
          this.successMsg.set('✅ Profile saved locally.');
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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .put(
        `${environment.apiUrl}/api/users/change-password`,
        { currentPassword: f.currentPassword, newPassword: f.newPassword },
        { headers },
      )
      .subscribe({
        next: () => {
          this.successMsg.set('✅ Password changed successfully!');
          this.passwordForm.set({ currentPassword: '', newPassword: '', confirmPassword: '' });
          this.isSaving.set(false);
        },
        error: (err) => {
          this.errorMsg.set(
            err.status === 400
              ? 'Current password is incorrect.'
              : 'Failed to change password. Try again.',
          );
          this.isSaving.set(false);
        },
      });
  }

  saveNotifications() {
    this.isSaving.set(true);
    localStorage.setItem('notifications', JSON.stringify(this.notifications()));
    setTimeout(() => {
      this.successMsg.set('✅ Notification preferences saved!');
      this.isSaving.set(false);
    }, 400);
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
