import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpServiceService {

  constructor(private http: HttpClient) { }

  getApi<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  postApi<T>(url: string, postData?: any): Observable<T> {
    return this.http.post<T>(url, postData);
  }

  putApi(url: string, putData: any) {
    return this.http.put(url, putData);
  }

  // deleteApi(url: string, id: number) {
  //   return this.http.delete(`${url}/${id}`);
  // }
}
