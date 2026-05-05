import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {
        console.log('未授權');
        router.navigate(['/login']);
      }

      if (error.status === 500) {
        console.log('伺服器錯誤');
      }

      return throwError(() => error);
    })
  );
};
