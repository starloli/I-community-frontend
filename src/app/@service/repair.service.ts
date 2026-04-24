import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { RepairStatus } from '../interface/enum';
import { RepairRequest } from '../interface/interface';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class RepairService {

  private apiUrl = '/repair';
  private adminUrl = '/admin/repair';
  private userUrl = '/user/repair';
  private repairsSubject = new BehaviorSubject<RepairRequest[]>([]);
  repairs$ = this.repairsSubject.asObservable();
  private userRepairsSubject = new BehaviorSubject<RepairRequest[]>([]);
  userRepairs$ = this.userRepairsSubject.asObservable();
  constructor(private http: HttpService) {}

  getAll() {
    return this.http.getApi<RepairRequest[]>(this.apiUrl).pipe(
      tap(data => this.repairsSubject.next(data))
    );
  }

  getUserAll() {
    return this.http.getApi<RepairRequest[]>(this.userUrl).pipe(
      tap(data => this.userRepairsSubject.next(data))
    );
  }

  post(data: Pick<RepairRequest, 'location' | 'category' | 'description'>) {
    return this.http.postApi<any>(
        this.apiUrl,
        data
      ).pipe(
        tap(newItem => {
          const current = this.repairsSubject.value;
          const userCurrent = this.userRepairsSubject.value;
          this.repairsSubject.next([...current, newItem]);
          this.userRepairsSubject.next([...userCurrent, newItem]);
        }),
        catchError((error) => {
          console.error('新增失敗', error);
          return throwError(() => error);
        })
      );
  }

  updateById(id: number, data: any) {
    return this.http.putApi<any>(
        `${this.adminUrl}/${id}`,
        data
      ).pipe(
        tap(updatedItem => {
          const current = this.repairsSubject.value;

          const updatedList = current.map(item =>
            item.repairId === id ? { ...item, ...data, ...updatedItem } : item
          );

          this.repairsSubject.next(updatedList);
        }),
        catchError((error) => {
          console.error('更新失敗', error);
          return throwError(() => error);
        })
      );
  }

  completeById(id: number, data: any = null) {
    return this.http.putApi<any>(
        `${this.adminUrl}/${id}/complete`,
        data
      ).pipe(
        tap(updatedItem => {
          const current = this.repairsSubject.value;

          const updatedList = current.map(item =>
            item.repairId === id
              ? {
                  ...item,
                  ...data,
                  ...updatedItem,
                  status: updatedItem?.status ?? RepairStatus.DONE,
                  handlerName: updatedItem?.handlerName ?? data?.handler ?? item.handlerName,
                  note: updatedItem?.note ?? data?.note ?? item.note,
                  resolvedAt: updatedItem?.resolvedAt ?? item.resolvedAt ?? new Date().toISOString()
                }
              : item
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
    return this.http.deleteApi<void>(`${this.adminUrl}/${id}`).pipe(
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
