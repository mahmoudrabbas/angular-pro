// guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  // Read directly from storage — avoids signal-not-hydrated issue on page refresh
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
  const raw = localStorage.getItem('user') ?? sessionStorage.getItem('user');
  const user = raw ? JSON.parse(raw) : null;

  // ✅ Logged in AND admin
  if (token && user?.role === 'admin') return true;

  // 🚫 Logged in but not admin → home
  if (token) {
    return router.createUrlTree(['/'], { queryParams: { forbidden: '1' } });
  }

  // 🔒 Not logged in → sign in
  return router.createUrlTree(['/signin'], { queryParams: { redirect: '/admin/dashboard' } });
};
