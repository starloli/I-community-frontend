import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  // 排除不需要 token 的 API
  if (req.url.includes('/login') || req.url.includes('/refresh')) {
    return next(req);
  }

  // 防止無效 token
  if (token && token !== 'null' && token !== 'undefined') {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
