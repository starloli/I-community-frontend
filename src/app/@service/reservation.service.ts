import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { HttpService } from './http.service';
import { ResReservation } from '../interface/interface';
import { ReservationStatus } from '../interface/enum';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = '/user/reservationsByUserId';
  private reservationsSubject = new BehaviorSubject<ResReservation[]>([]);
  userReservations$ = this.reservationsSubject.asObservable();

  constructor(private http: HttpService) {}

  getUserReservations(userId: number): Observable<ResReservation[]> {
    return this.http.getApi<Array<ResReservation>>(this.apiUrl, userId).pipe(
      map(res => {
        const sortedReservations = [...(res ?? [])].sort(
          (a, b) => this.getReservationSortTime(b) - this.getReservationSortTime(a)
        );
        this.reservationsSubject.next(sortedReservations);
        return sortedReservations;
      }),
      catchError(error => {
        console.error('取得預約失敗', error);
        return throwError(() => error);
      })
    );
  }

  getConfirmedReservationCount(): Observable<number> {
    return this.userReservations$.pipe(
      map(reservations =>
        reservations.filter(
          reservation =>
            reservation.status === ReservationStatus.CONFIRMED &&
            !this.isReservationExpired(reservation)
        ).length
      )
    );
  }

  isReservationExpired(reservation: ResReservation): boolean {
    const reservationEnd = this.buildReservationDateTime(reservation.date, reservation.endTime);
    if (!reservationEnd) {
      return false;
    }
    return reservationEnd.getTime() < Date.now();
  }

  private buildReservationDateTime(date: string, time: string): Date | null {
    if (!date || !time) {
      return null;
    }
    const safeTime = time.length === 5 ? `${time}:00` : time;
    const parsed = new Date(`${date}T${safeTime}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private getReservationSortTime(reservation: ResReservation): number {
    const reservationStart = this.buildReservationDateTime(reservation.date, reservation.startTime);
    return reservationStart?.getTime() ?? 0;
  }
}
