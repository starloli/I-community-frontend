import { ResetPasswordComponent } from '../pages/reset-password/reset-password.component';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { VerifyCodeType } from '../interface/enum';
import { updateUser } from '../interface/interface';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private toast = inject(ToastService);
  private apiUrl = 'http://localhost:8083';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(userName: string, password: string) {
    return this.http.post<any>(
      this.apiUrl + '/auth/login',
      {
        "userName": userName,
        "password": password
      },
      { observe: 'response' }
    )
      .pipe(
        tap((res: HttpResponse<any>) => {
          localStorage.setItem('token', res.body.accessToken);
        })
      );
  }

  forgetPassword(email: string) {
    return this.http.post(
      this.apiUrl + '/auth/forgot-password',
      {
        "email": email
      }
    ).pipe(
      catchError((error) => {
        console.error('API error:', error);

        let message = '信箱錯誤';
        if (error.error?.message) {
          message = error.error.message;
        }

        return throwError(() => new Error(message));
      }))
  }

  resetPassword(token: string, npw: string) {
    return this.http.post(
      this.apiUrl + '/auth/reset-password',
      {
        "token": token,
        "newPassword": npw
      }
    ).pipe(
      catchError((error) => {
        console.error('API error:', error);

        let message = '重置密碼錯誤';
        if (error.error?.message) {
          message = error.error.message;
        }

        return throwError(() => new Error(message));
      }))
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getUser()?.role === 'ADMIN' || this.getUser()?.role === 'SUPER_ADMIN';
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // 檢查是否過期
      const now = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp > now;

    } catch {
      return false;
    }
  }

  logout(): void {
    if (confirm('確定要登出嗎？')) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      this.toast.success('登出成功', 2000);
    }
  }

  sendEmailcode(email: string) {
    return this.http.post(
      this.apiUrl + '/auth/email/code',
      {
        "email": email
      }
    ).pipe(
      catchError((error) => {
        console.error('API error:', error);

        let message = '信箱錯誤';
        if (error.error?.message) {
          message = error.error.message;
        }

        return throwError(() => new Error(message));
      }))
  }

  verifyEmail(email: string, code: string) {
    return this.http.post(
      this.apiUrl + '/auth/email/verify',
      {
        "email": email,
        "code": code
      }
    ).pipe(
      catchError((error) => {
        console.error('API error:', error);

        let message = '信箱認證錯誤';
        if (error.error?.message) {
          message = error.error.message;
        }

        return throwError(() => new Error(message));
      }))
  }

  sendVerifyCode(email: string, type: VerifyCodeType): Observable<any> {
    return this.http.post(
      this.apiUrl + '/modify/superadmin/send-verify-code',
      {
        "email": email,
        "type": type
      }
    ).pipe(
      catchError((error) => {
        console.error('API error:', error);

        let message = '驗證碼發送錯誤';
        if (error.error?.message) {
          message = error.error.message;
        }

        return throwError(() => new Error(message));
      }))
  }

  updateSuperAdminSelf(updateData: updateUser): Observable<any> {
    return this.http.put(
      this.apiUrl + '/modify/superadmin/self',
      updateData
    ).pipe(
      catchError((error) => {
        console.error('API error:', error);

        let message = '更新超級管理員資料錯誤';
        if (error.error?.message) {
          message = error.error.message;
        }

        return throwError(() => new Error(message));
      }))
  }
}
