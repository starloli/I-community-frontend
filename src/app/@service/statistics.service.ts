import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError, Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private apiUrl = 'http://localhost:8083/statistics';

  constructor(private http: HttpClient) {}

  getUserNum(): Observable<number> {
    return this.http.get<any>(this.apiUrl)
        .pipe(
          map(x => x.userNum),
          catchError((error) => {
            console.error('查詢使用者數量失敗', error);
            return throwError(() => error);
        }))
  }
}
