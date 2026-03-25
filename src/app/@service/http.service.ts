import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) { }

  getApi<T>(url: string, id?: number, id2?: number): Observable<T> {
    if (id) {
      if (id2) {
        url = `${url}/${id}/${id2}`;
      } else {
        url = `${url}/${id}`;
      }
    }
    return this.http.get<T>(url);
  }

  postApi<T>(url: string, postData?: any): Observable<T> {
    return this.http.post<T>(url, postData);
  }

  putApi(url: string, putData?: any) {
    return this.http.put(url, putData);
  }

  deleteApi(url: string, id: number) {
    return this.http.delete(`${url}/${id}`);
  }
}
