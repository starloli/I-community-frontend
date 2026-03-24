import { Component, ChangeDetectionStrategy, inject,Injectable} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogModule,
  MatDialogTitle, } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

import { ApiService } from '../../services/api.service';
import { HttpParams } from '@angular/common/http';
import { VisitorDialogComponent } from '../../dialog/visitor-dialog/visitor-dialog.component';
import { VisitorServiceService } from '../../@service/visitor-service.service';

import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {Subject} from 'rxjs';
import { RouterLink } from "@angular/router";

import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-admin-visitor',
  imports: [MatIconModule, MatButtonModule, MatDialogModule, CommonModule, FormsModule, MatPaginatorModule, RouterLink, ],
  templateUrl: './admin-visitor.component.html',
  styleUrl: './admin-visitor.component.scss'
})
export class AdminVisitorComponent {

readonly dialog = inject(MatDialog);

  openDialog() {
    this.dialog.open(VisitorDialogComponent);
  }



  constructor(private http: ApiService ,private service:VisitorServiceService) { }

  //獲取api

//管理者
  allVisitor!: any;
// 新增訪客要用的
step=1;
address!:string;



  // ===== 控制新增表單是否顯示 =====
  showForm = false;

  // ===== 新增訪客的表單資料 =====
// 訪客名字
    newVisitorName:string="";
    // 訪客電話
    newVisitorPhone:string= '';
//  訪客車牌
    newVisitorLicensePlate:string= '';
//訪客目的
newVisitorPurpose:string='';
//被訪問住戶
residentsInterviewed:string='';

//下拉式選單    //可以刪掉 不需要  因爲是綁定的id
selectedAddress!:string;
//得到住戶id
addressID!:number;

// 1. 定義時不指定泛型，直接用 any
addressMap = new Map<string, any>();

// 2. 或者在初始化時完全不寫型別 (TypeScript 會推斷它是 Map<any, any>)
addressList: any = [];
currentResidents: any[] = [];
ngOnInit(): void {
this.getAllVisitors();
this.getAllAdress();
}


  // ===== 搜尋關鍵字 =====
  searchKeyword = '';

  // ===== 過濾後的訪客列表 =====
  // 根據搜尋關鍵字即時過濾，符合姓名、電話、門牌、車牌、預約時間其中一個就顯示
  get filteredVisitors() {
    if (!this.searchKeyword.trim()) {
      return this.allVisitor; // 沒有關鍵字就顯示全部
    }
    const keyword = this.searchKeyword.toLowerCase();
    return this.allVisitor.filter((v: any) =>
      (v.visitorName?.toLowerCase().includes(keyword)) ||
      (v.visitorPhone?.includes(keyword)) ||
      (v.purpose?.includes(keyword)) ||
      (v.licensePlate?.toLowerCase().includes(keyword)) ||

      (v.estimatedTime?.includes(keyword))
      // (v.checkOutTime?.includes(keyword))
      // || (v.residentName?.includes(keyword))
    );
  }



  // 開啟新增表單
  openForm() {
    this.showForm = true;
  }

  closeForm(){
    this.showForm=false;
    this.currentResidents=[];
    this.addressID=0;
    //可以刪掉 不需要  因爲是綁定的id
    this.selectedAddress='';
this.step=1;

  }

  // 關閉新增表單並清空欄位




  // ===== 訪客離開（更新狀態）=====
  // TODO: 之後改成呼叫 PUT /api/v1/visitors/{id}/checkout 更新後端資料
  checkOut(left: any) {
    console.log(left);

    this.http.putApi("/visitor/checkOut/" + left).subscribe((res: any) => {
      console.log(res);
      this.getAllVisitors();
    })
  }
  Enter(inside :any){
console.log(inside);


    this.http.putApi("/visitor/inside/" + inside).subscribe((res: any) => {
      console.log(res);
      this.getAllVisitors();
  })}







nextStep(){
  this.step++;

}
lastStep(){
  this.step--;
}

//得到全部住戶的地址
getAllAdress(){
  this.http.getApi("/visitor/allAddresses").subscribe((res:any)=>{
    this.addressList = res.sort();
    console.log(this.addressList);
  })
}

onAddressChange(addr: any) {
  this.currentResidents = []; // 先清空，避免畫面殘留舊住戶

  if (!addr) return; // 如果選到空的就直接結束

  if (this.addressMap.has(addr)) {
    console.log('從 Map 緩存讀取:', addr);
    this.currentResidents = this.addressMap.get(addr);
  } else {
    this.getResidentData(addr);
  }
}


//管理者新增訪客測試

adminTestapi(){

  const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  if (!this.newVisitorName || this.newVisitorName.trim() === '') {return; }
let userTest={
  "visitorName": this.newVisitorName,
  "visitorPhone": this.newVisitorPhone,
  "licensePlate": this?.newVisitorLicensePlate,
  "purpose": this.newVisitorPurpose,
   "hostUserId" :this.addressID,
  "checkInTime": now,
  // "checkOutTime": "2026-03-20T17:00:00",
  // "registeredBy": "張三",
  "status": "INSIDE"
}



  this.http.postApi("/visitor/saveVisitor",userTest).subscribe((res :any)=>{
    console.log(res);
console.log("成功");
this.getAllVisitors();
this.closeForm();
  })
}
isComposing = false; // 追蹤是否正在選字中

onCompositionStart() {
  this.isComposing = true;
}

onCompositionEnd(event: any) {
  this.isComposing = false;
  // 選字完成後，執行一次過濾
  this.filterInput(event);
}

filterInput(event: any) {
  if (this.isComposing) return; // 如果正在選字，不執行過濾

  const regex = /[^a-zA-Z\u4e00-\u9fa5]/g;
  const value = event.target.value;

  // 執行過濾並回填
  this.newVisitorName = value.replace(regex, '');
  event.target.value = this.newVisitorName;
}








  ad: string = "10棟98樓71F";

getResidentData(address: string) {
  console.log('開始查詢地址:', address);


  const url = `/visitor/by-address?address=${encodeURIComponent(address)}`;

  this.http.getApi(url).subscribe({
    next: (data: any) => {
      this.currentResidents = data;
   this.addressMap.set(address, data);
  //  console.log('查詢成功並存入 Map:', data);

      if (!data || data.length === 0) {
        console.log("沒有這個住戶");

      }
    },
    error: (err:any) => {
      console.error('查詢出錯:', err);
this.currentResidents = [];
    }
  });
}





getAllVisitors() {
  console.log("---------------");

  console.log(localStorage.getItem('token'));

  this.http.getApi('/visitor/getVisitor').subscribe({
    next: (res: any) => {
      console.log('後端回傳的原始資料:', res);

      if (Array.isArray(res)) {
        this.allVisitor = res;

      } else if (res && Array.isArray(res.data)) {
        this.allVisitor = res.data;
      } else {
        this.allVisitor = [];
      }
       this.allVisitor = this.allVisitor.map((v: any) => ({
        ...v,
        // 檢查是否有時間，有的話將 'T' 換成空格並截取前 16 個字元
        estimatedTime: v.estimatedTime ? v.estimatedTime.replace('T', ' ').slice(0, 16) : '-',
        checkInTime: v.checkInTime ? v.checkInTime.replace('T',' ').slice(0,16): '-',
        checkOutTime: v.checkOutTime ? v.checkOutTime.replace('T', ' ').slice(0, 16) : '-',
      }));
              console.log(this.allVisitor)
              this.allVisitor=this.allVisitor.reverse();
    },
    error: (err :any) => {
      console.error('API 請求失敗:', err);
    }
  });
}
//獲取更多訪客資料
visitorMore(visitorId :any){
  console.log(visitorId);
this.service.visitorId=visitorId;
this.service.permissions='admin';
this.openDialog();
}






  getVisitorData() {
    this.http.getApi('/visitor/getVisitor').subscribe((res: any) => {
      this.allVisitor = res;
      console.log(this.allVisitor);


    })
  }


}
