import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  // ===== API 基礎網址 =====
  // TODO: 之後改成正式環境的網址
  private baseUrl = 'http://localhost:8083';

  constructor(private httpClient: HttpClient) {}

  // 取得資料
  getApi(url: string, options?: any) {
    return this.httpClient.get(`${this.baseUrl}${url}`);
  }

  // 新增資料
  postApi(url: string, postData: any) {
    return this.httpClient.post(`${this.baseUrl}${url}`, postData);
  }

  // 更新資料
  putApi(url: string, putData?: any) {
    return this.httpClient.put(`${this.baseUrl}${url}`, putData);
  }

  // 刪除資料
  delApi(url: string) {
    return this.httpClient.delete(`${this.baseUrl}${url}`);
  }
}
