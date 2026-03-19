import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {
        console.log('未授權');
      }

      if (error.status === 500) {
        console.log('伺服器錯誤');
      }

      return throwError(() => error);
    })
  );
};
