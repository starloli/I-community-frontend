import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');
  const apiUrl = 'http://localhost:8083'; // 確保與後端 API 基礎網址一致

  // 排除不需要 token 的 API (如登入)
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  // 檢查是否為後端 API 請求且 token 存在
  if (req.url.startsWith(apiUrl) && token && token !== 'null' && token !== 'undefined') {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
