import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8083';

  constructor(private http: HttpClient) {}

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
    return this.getUser()?.role === 'ADMIN';
  }
}
