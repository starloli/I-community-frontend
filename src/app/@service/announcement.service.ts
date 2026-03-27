import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private apiUrl = 'http://localhost:8083';
  private announsSubject = new BehaviorSubject<any[]>([]);
  announs$ = this.announsSubject.asObservable();

  constructor(private http: HttpClient) {}

  postAnnoun(data: any) {
    return this.http.post<any>(
        this.apiUrl + '/admin/announ',
        {
          title: data.title,
          content: data.content,
          category: data.category,
          expiresAt: data.expiresAt,
          isPinned: data.isPinned
        }
      ).pipe(
        tap(newItem => {
          const current = this.announsSubject.value;
          this.announsSubject.next([...current, newItem]);
        }),
        catchError((error) => {
          console.error('新增失敗', error);
          return throwError(() => error);
        })
      );
  }

  getAll() {
    return this.http.get<any[]>(this.apiUrl + '/announ').pipe(
      tap(data => this.announsSubject.next(data))
    );
  }

  getById(id: number) {
    return this.http.get<any>(`${this.apiUrl + '/announ'}/${id}`)
  }

  updateById(id: number, data: any) {
    return this.http.put<any>(
        `${this.apiUrl + '/admin/announ'}/${id}`,
        {
          title: data.title,
          content: data.content,
          category: data.category,
          expiresAt: data.expiresAt,
          isPinned: data.isPinned
        }
      ).pipe(
        tap(updatedItem => {
          const current = this.announsSubject.value;

          const updatedList = current.map(item =>
            item.announcementId === id ? { ...item, ...updatedItem } : item
          );

          this.announsSubject.next(updatedList);
        }),
        catchError((error) => {
          console.error('更新失敗', error);
          return throwError(() => error);
        })
      );
  }

  deleteById(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl + '/admin/announ'}/${id}`).pipe(
      tap(() => {
        const currentSurveys = this.announsSubject.value;
        const updatedSurveys = currentSurveys.filter(s => s.announcementId !== id);
        this.announsSubject.next(updatedSurveys);
      }),
      map(() => true),
      catchError((error) => {
        console.error('刪除失敗', error);
        return of(false);
      })
    );
  }
}
