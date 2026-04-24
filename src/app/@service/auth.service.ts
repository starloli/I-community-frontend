import { ResetPasswordComponent } from '../pages/reset-password/reset-password.component';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private snackBar = inject(MatSnackBar);
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
      this.snackBar.open('登出成功', '關閉', { duration: 2000 });
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

  // TODO: 【Phase 5】超級管理員密碼驗證和信箱驗證相關方法
  // 
  // 1. verifySuperAdminPassword(password: string): Observable<any>
  //    - POST 到 /modify/superadmin/verify-password
  //    - 進入編輯頁面前驗證舊密碼
  //    - 返回 { message, valid }
  //
  // 2. sendSuperAdminPasswordChangeCode(): Observable<any>
  //    - POST 到 /modify/superadmin/send-change-verify-code
  //    - 在點擊「儲存變更」時發送驗證碼到舊信箱
  //    - 返回 { message, expiresIn: 900 }
  //
  // 3. updateSuperAdminSelf(updateData: any): Observable<any>
  //    - PUT 到 /modify/superadmin/self
  //    - 驗證碼驗證成功後，執行最終更新
  //    - updateData 包含 verifyCode 字段
  //    - 返回 { message }
}
