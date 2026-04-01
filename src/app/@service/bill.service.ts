import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { Bill } from '../interface/interface';

@Injectable({
  providedIn: 'root'
})
export class BillService {

  private apiUrl = 'http://localhost:8083';
  private billsSubject = new BehaviorSubject<Bill[]>([]);
  bills$ = this.billsSubject.asObservable();

  private adminBillsSubject = new BehaviorSubject<any[]>([]);
  adminBills$ = this.adminBillsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * 住戶取得自己的帳單
   */
  getMyBills() {
    return this.http.get<Bill[]>(`${this.apiUrl}/user/bills`).pipe(
      tap(data => this.billsSubject.next(data))
    );
  }

  /**
   * 管理員取得所有帳單
   */
  getAllBills() {
    return this.http.get<any[]>(`${this.apiUrl}/admin/bills`).pipe(
      tap(data => this.adminBillsSubject.next(data))
    );
  }

  /**
   * 繳費
   */
  payBill(id: number, paymentMethod: string) {
    return this.http.post(`${this.apiUrl}/user/bills/${id}/pay`, { paymentMethod }).pipe(
      tap(() => {
        const current = this.billsSubject.value;
        const updated = current.map(b =>
          b.id === id ? { ...b, status: 'PAID' as any, paidAt: new Date().toISOString() } : b
        );
        this.billsSubject.next(updated);
      })
    );
  }
}
