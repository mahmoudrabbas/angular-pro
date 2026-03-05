import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  //i added this to get token from local storage or session storage for cart and checkout
  const localToken = localStorage.getItem('token');
  const sessionToken = sessionStorage.getItem('token');
  const token = localToken || sessionToken;

  console.log('[AuthInterceptor]', req.url, {
    localToken: !!localToken,
    sessionToken: !!sessionToken,
    willAttach: !!token,
  });

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};
