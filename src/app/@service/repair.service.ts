import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { RepairRequest } from '../interface/interface';

@Injectable({
  providedIn: 'root'
})
export class RepairService {

  private apiUrl = 'http://localhost:8083/repair';
  private adminUrl = 'http://localhost:8083/admin/repair';
  private userUrl = 'http://localhost:8083/user/repair';
  private repairsSubject = new BehaviorSubject<RepairRequest[]>([]);
  repairs$ = this.repairsSubject.asObservable();
  private userRepairsSubject = new BehaviorSubject<RepairRequest[]>([]);
  userRepairs$ = this.userRepairsSubject.asObservable();
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<RepairRequest[]>(this.apiUrl).pipe(
      tap(data => this.repairsSubject.next(data))
    );
  }

  getUserAll() {
      return this.http.get<RepairRequest[]>(this.userUrl).pipe(
        tap(data => this.userRepairsSubject.next(data))
      );
    }

  post(data: any) {
    return this.http.post<any>(
        this.apiUrl,
        data
      ).pipe(
        tap(newItem => {
          const current = this.userRepairsSubject.value;
          this.userRepairsSubject.next([...current, newItem]);
        }),
        catchError((error) => {
          console.error('新增失敗', error);
          return throwError(() => error);
        })
      );
  }

  updateById(id: number, data: any) {
    return this.http.put<any>(
        `${this.adminUrl}/${id}`,
        data
      ).pipe(
        tap(updatedItem => {
          const current = this.repairsSubject.value;

          const updatedList = current.map(item =>
            item.repairId === id ? { ...item, ...updatedItem } : item
          );

          this.repairsSubject.next(updatedList);
        }),
        catchError((error) => {
          console.error('更新失敗', error);
          return throwError(() => error);
        })
      );
  }

  completeById(id: number) {
    return this.http.put<any>(
        `${this.adminUrl}/${id}/complete`,
        null
      ).pipe(
        tap(updatedItem => {
          const current = this.repairsSubject.value;

          const updatedList = current.map(item =>
            item.repairId === id ? { ...item, ...updatedItem } : item
          );

          this.repairsSubject.next(updatedList);
        }),
        catchError((error) => {
          console.error('更新失敗', error);
          return throwError(() => error);
        })
      );
  }

  deleteById(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`).pipe(
      tap(() => {
        const currentSurveys = this.repairsSubject.value;
        const updatedSurveys = currentSurveys.filter(s => s.repairId !== id);
        this.repairsSubject.next(updatedSurveys);
      }),
      map(() => true),
      catchError((error) => {
        console.error('刪除失敗', error);
        return of(false);
      })
    );
  }
}
