import { Injectable, signal } from '@angular/core';

export interface StoredUser {
  name: string;
  email: string;
  createdAt?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly fallback: StoredUser = { name: 'My Account', email: 'my@email.com' };

  user = signal<StoredUser>(this.load());

  private load(): StoredUser {
    try {
      const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
      return raw ? JSON.parse(raw) : this.fallback;
    } catch {
      return this.fallback;
    }
  }

  updateUser(patch: Partial<StoredUser>) {
    const updated = { ...this.user(), ...patch };

    // console.log(updated)
    // console.log("1");

    if (localStorage.getItem('user')) {
      // console.log("2");

      localStorage.setItem('user', JSON.stringify(updated));
    } else if (sessionStorage.getItem('user')) {
      // console.log("it comes here 3");

      sessionStorage.setItem('user', JSON.stringify(updated));
    }

    this.user.set(updated);
  }

  clear() {
    // localStorage.removeItem('token');
    // localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    this.user.set(this.fallback);
  }
}
