import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Announcement, AnnouncementPayload } from '../interface/interface';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {

  private apiUrl = 'http://localhost:8083'; // 與攔截器中的 apiUrl 一致
  private announsSubject = new BehaviorSubject<Announcement[]>([]);
  announs$ = this.announsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ── 管理員維護 API (路徑首碼: /admin/announ) ──────────────────────────

  /**
   * 發佈新公告 (POST /admin/announ)
   * 系統會自動抓取當前登入的管理員名稱作為發佈者。
   */
  postAnnoun(data: AnnouncementPayload) {
    return this.http.post<Announcement>(`${this.apiUrl}/admin/announ`, data).pipe(
      tap(newItem => {
        const current = this.announsSubject.value;
        this.announsSubject.next([newItem, ...current]);
      }),
      catchError((error) => {
        console.error('發佈公告失敗', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * 修改指定公告 (PUT /admin/announ/{id})
   */
  updateById(id: number, data: AnnouncementPayload) {
    return this.http.put<Announcement>(`${this.apiUrl}/admin/announ/${id}`, data).pipe(
      tap(updatedItem => {
        const current = this.announsSubject.value;
        const updatedList = current.map(item =>
          item.announcementId === id ? { ...item, ...updatedItem } : item
        );
        this.announsSubject.next(updatedList);
      }),
      catchError((error) => {
        console.error('更新公告失敗', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * 刪除指定公告 (DELETE /admin/announ/{id})
   */
  deleteById(id: number): Observable<boolean> {
    return this.http.delete<void>(`${this.apiUrl}/admin/announ/${id}`).pipe(
      tap(() => {
        const current = this.announsSubject.value;
        this.announsSubject.next(current.filter(a => a.announcementId !== id));
      }),
      map(() => true),
      catchError((error) => {
        console.error('刪除公告失敗', error);
        return of(false);
      })
    );
  }

  // ── 一般用戶 API (路徑首碼: /announ) ──────────────────────────────────

  /**
   * 取得所有社區公告列表 (GET /announ)
   */
  getAll() {
    return this.http.get<Announcement[]>(`${this.apiUrl}/announ`).pipe(
      tap(data => this.announsSubject.next(data))
    );
  }

  /**
   * 根據公告 ID 取得單一公告的詳細內容 (GET /announ/{id})
   */
  getById(id: number) {
    return this.http.get<Announcement>(`${this.apiUrl}/announ/${id}`);
  }
}
