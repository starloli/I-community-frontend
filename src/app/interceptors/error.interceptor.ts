import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {
        console.warn('Token 已失效或未授權，正在引導至登入頁面...');
        localStorage.removeItem('token'); // 清除失效 token
        router.navigate(['/login']);    // 跳轉回登入頁面
      }

      if (error.status === 500) {
        console.error('伺服器錯誤:', error.message);
      }

      return throwError(() => error);
    })
  );
};
