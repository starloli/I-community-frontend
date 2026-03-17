import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
constructor(private httpClient:HttpClient) { }
  getApi(url:string){
    return this.httpClient.get(url);
  }

//新增
  postApi(url:string, postData:any){
    return this.httpClient.post(url,postData);
  }
//更新
  putApi(url:string, putData:any){
    return this.httpClient.put(url,putData)
  }

//刪除
  delApi(url:string){
    return this.httpClient.delete(url)
  }
}

