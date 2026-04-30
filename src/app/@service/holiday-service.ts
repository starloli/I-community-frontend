import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Holiday } from '../interface/interface';

@Injectable({
  providedIn: 'root',
})
export class HolidayService {

  private apiUrl = 'http://localhost:8083/calendar';

  constructor(private http: HttpClient) {}

  getHolidays(start: string): Observable<Holiday[]> {
    const params = new HttpParams()
      .set('start', start)

    return this.http.get<Holiday[]>(this.apiUrl + '/holiday', { params });
  }

  getEvents(start: string): Observable<Holiday[]> {
    const params = new HttpParams()
      .set('start', start)

    return this.http.get<Holiday[]>(this.apiUrl, { params });
  }

  getReservations(start: string): Observable<Holiday[]> {
    const params = new HttpParams()
      .set('start', start)

    return this.http.get<Holiday[]>(this.apiUrl + '/reservation', { params });
  }

  postEvent(event: any) {
    return this.http.post<Holiday>(this.apiUrl, event);
  }

  deleteEvent(id: number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
