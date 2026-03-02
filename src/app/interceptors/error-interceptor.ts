import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

// error-interceptor.ts
// error-interceptor.ts
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // robust detection for login endpoint
  const url = req.url || '';
  const isLoginRequest = url.endsWith('/signin') || url.includes('/auth/signin');

  return next(req).pipe(
    catchError((err) => {
      if (err?.status === 401 && !isLoginRequest) {
        localStorage.removeItem('token');
        router.navigate(['/signin']);
      }

      if (err?.status === 403 && !isLoginRequest) {
        router.navigate(['/forbidden']);
      }

      // always rethrow the original error so auth service can map it
      return throwError(() => err);
    }),
  );
};
