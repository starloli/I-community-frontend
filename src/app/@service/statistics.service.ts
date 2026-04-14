import { Injectable } from '@angular/core';
import { catchError, throwError, Observable, map } from 'rxjs';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private apiUrl = '/statistics';

  constructor(private http: HttpService) {}

  getUserNum(): Observable<number> {
    return this.http.getApi<any>(this.apiUrl)
        .pipe(
          map(x => x.userNum),
          catchError((error) => {
            console.error('查詢使用者數量失敗', error);
            return throwError(() => error);
        }))
  }
}
