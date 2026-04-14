import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private baseUrl = 'http://localhost:8083';

  constructor(private http: HttpClient) { }

  getApi<T>(url: string, id?: number, id2?: number): Observable<T> {
    url = `${this.baseUrl}${url}`;
    if (id) {
      if (id2) {
        url = `${url}/${id}/${id2}`;
      } else {
        url = `${url}/${id}`;
      }
    }
    return this.http.get<T>(url);
  }

  postApi<T>(url: string, postData?: any, options?: any): Observable<T> {
    url = `${this.baseUrl}${url}`;
    return this.http.post<T>(url, postData, options) as Observable<T>;
  }

  putApi(url: string, putData?: any) {
    url = `${this.baseUrl}${url}`;
    return this.http.put(url, putData);
  }

  deleteApi(url: string, id?: number) {
    url = `${this.baseUrl}${url}`;
    return this.http.delete(`${url}/${id}`);
  }
}
