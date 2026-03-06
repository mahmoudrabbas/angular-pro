import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ─── FIX: Auth service saves to sessionStorage when rememberMe=false,
  //          and to localStorage when rememberMe=true.
  //          The old interceptor only checked localStorage, so tokens saved
  //          in sessionStorage were never sent → backend returned "Please Signin".
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};
