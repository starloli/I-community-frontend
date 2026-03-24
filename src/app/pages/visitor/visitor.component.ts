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
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HttpParams } from '@angular/common/http';
import { VisitorDialogComponent } from '../../dialog/visitor-dialog/visitor-dialog.component';
import { VisitorServiceService } from '../../@service/visitor-service.service';
import '@angular/localize/init';
import {MatPaginatorIntl, MatPaginatorModule} from '@angular/material/paginator';
import {Subject} from 'rxjs';
import { RouterLink } from "@angular/router";



@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule, CommonModule, FormsModule, MatPaginatorModule, RouterLink,],
  templateUrl: './visitor.component.html',
  styleUrl: './visitor.component.scss'
})
export class VisitorComponent {
readonly dialog = inject(MatDialog);

  openDialog() {
    this.dialog.open(VisitorDialogComponent);
  }



  constructor(private http: ApiService ,private service:VisitorServiceService) { }

  //獲取api

//管理者 可刪掉
  allVisitor!: any;



//住戶端的訪客獲取
myAllVisitor!:any;

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

//預計到達時間
estimatedTime!:string;
minDateTime: string = '';
ngOnInit(): void {
this.getMyVisitors();
this.updateMinDateTime();
}

updateMinDateTime() {
    const now = new Date();
    // 考慮時區偏移，轉成 ISO 格式並截取前 16 位 (YYYY-MM-DDTHH:mm)
    const tzOffset = now.getTimezoneOffset() * 60000;
    this.minDateTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  }
  onTimeChange(event: any) {
  this.updateMinDateTime();
  const selectedValue = event.target.value;

  if (selectedValue && selectedValue < this.minDateTime) {


    // 1. 強制修改 HTML 元素的顯示值 (這是最有效的)
    event.target.value = this.minDateTime;

    // 2. 同步更新 Angular 內部的變數
    this.estimatedTime = this.minDateTime;

    // 3. 雙重保險：讓 Angular 知道值變了
    setTimeout(() => {
      this.estimatedTime = this.minDateTime;
    }, 0);
  }
}
  // ===== 搜尋關鍵字 =====
  searchKeyword = '';

  // ===== 過濾後的訪客列表 =====
  // 根據搜尋關鍵字即時過濾，符合姓名、電話、門牌、車牌、時間其中一個就顯示
  get filteredVisitors() {
    if (!this.searchKeyword.trim()) {
      return this.myAllVisitor; // 沒有關鍵字就顯示全部
    }
    const keyword = this.searchKeyword.toLowerCase();
    return this.myAllVisitor.filter((v: any) =>
      (v.visitorName?.toLowerCase().includes(keyword)) ||
      (v.visitorPhone?.includes(keyword)) ||
      (v.purpose?.includes(keyword)) ||
      (v.licensePlate?.toLowerCase().includes(keyword))
      // (v.checkInTime?.includes(keyword)) ||
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
console.log(this.estimatedTime);


  }

  // 關閉新增表單並清空欄位




  // ===== 訪客離開（更新狀態）=====
  // TODO: 之後改成呼叫 PUT /api/v1/visitors/{id}/checkout 更新後端資料
  checkOut(left: any) {
    console.log(left);

    this.http.putApi("/visitor/checkOut/" + left).subscribe((res: any) => {
      console.log(res);
      this.getMyVisitors();
    })

  }



// //管理者
// testdata={

//  "visitorName": "測試訪客小張",
//  "visitorPhone": "0912345678",

//  "licensePlate": "ABC-134",
//  "hostUserId": 9,
//  "purpose": "拜訪",


//  //抓現在時間
//  "checkInTime": "2026-03-18T09:00:00",
//  "checkOutTime": "2026-03-18T10:00:00",
// //  管理者名字
//  "registeredBy": "李四先生",
//  "status": "INSIDE"

// }

//  test(){
// this.http.postApi("/visitor/saveVisitor",this.testdata).subscribe((res:any)=>{
//   console.log(res);

// })
// }


//住戶新增訪客測試

usertestapi(){

  // const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  // if (!this.newVisitorName || this.newVisitorName.trim() === '') {return; }
let userTest={
  "visitorName": this.newVisitorName,
  "visitorPhone": this.newVisitorPhone,
  "licensePlate": this?.newVisitorLicensePlate,
  "purpose": this.newVisitorPurpose,

  // "checkInTime": now,
  // "checkOutTime": "2026-03-20T17:00:00",
  // "registeredBy": "張三",
  "estimatedTime":this.estimatedTime,
  "status": "NOTYET"
}



  this.http.postApi("/visitor/user/save",userTest).subscribe((res :any)=>{
    console.log(res);
console.log("成功");
this.getMyVisitors();
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










getResidentData(address: string) {
  console.log('開始查詢地址:', address);

  // 修正：補上路徑，並使用 encodeURIComponent 處理中文字
  const url = `/visitor/by-address?address=${encodeURIComponent(address)}`;

  this.http.getApi(url).subscribe({
    next: (data: any) => {
      this.myAllVisitor = data;
      console.log('查詢成功，收到資料:', this.myAllVisitor);
      if (!data || data.length === 0) {
        console.log("沒有這個住戶");

      }
    },
    error: (err) => {
      console.error('查詢出錯:', err);

    }
  });
}





getMyVisitors() {
  console.log("---------------");

  console.log(localStorage.getItem('token'));

  this.http.getApi('/visitor/my-visitors').subscribe({
    next: (res: any) => {
    //   console.log('後端回傳的原始資料:', res);

    //   if (Array.isArray(res)) {
    //     this.myAllVisitor = res;

    //   } else if (res && Array.isArray(res.data)) {
    //     this.myAllVisitor = res.data;
    //   } else {
    //     this.myAllVisitor = [];
    //   }
    //    this.myAllVisitor = this.myAllVisitor.map((v: any) => ({
    //     ...v,
    //     // 檢查是否有時間，有的話將 'T' 換成空格並截取前 16 個字元
    //     estimatedTime: v.estimatedTime ? v.estimatedTime.replace('T', ' ').slice(0, 16) : '-',
    //     checkInTime :v.checkInTime ? v.checkInTime.replace('T', ' ').slice(0,16): '-',
    //     checkOutTime: v.checkOutTime ? v.checkOutTime.replace('T', ' ').slice(0, 16) : '-',
    //   }));
    //           console.log(this.myAllVisitor)
    //           this.myAllVisitor=this.myAllVisitor.reverse();
    // },
    // error: (err) => {
    //   console.error('API 請求失敗:', err);
    // }
    // ... 前面的資料處理與 T 換空格邏輯 ...
    let processedData = Array.isArray(res) ? res : (res?.data || []);

    const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');

    this.myAllVisitor = processedData.map((v: any) => ({
      ...v,
      // 保持原始字串格式方便比較，或者先格式化
      formattedEstimated: v.estimatedTime ? v.estimatedTime.replace('T', ' ').slice(0, 16) : '9999-12-31',
      estimatedTime: v.estimatedTime ? v.estimatedTime.replace('T', ' ').slice(0, 16) : '-',
      checkInTime: v.checkInTime ? v.checkInTime.replace('T', ' ').slice(0, 16) : '-',
      checkOutTime: v.checkOutTime ? v.checkOutTime.replace('T', ' ').slice(0, 16) : '-',
    }));

    // --- 自定義權重排序開始 ---
    this.myAllVisitor.sort((a :any, b:any) => {
      const getPriority = (visitor: any) => {
        // 1. 未到且日期還沒過期 (最優先)
        if (visitor.status === 'NOTYET' && visitor.formattedEstimated >= nowStr) return 1;
        // 2. 人在裡面 (第二優先)
        if (visitor.status === 'INSIDE') return 2;
        // 3. 已完成離開 (第三)
        if (visitor.status === 'COMPLETED') return 3;
        // 4. 未到但已經過期 (放最後)
        if (visitor.status === 'NOTYET' && visitor.formattedEstimated < nowStr) return 4;
        return 5; // 其他未知狀態
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB; // 權重小的排前面
      }

      // 如果權重相同，則按預約日期排序 (最近的日期排前面)
      return a.formattedEstimated.localeCompare(b.formattedEstimated);
    });
    // --- 自定義權重排序結束 ---

    console.log('排序後的訪客清單:', this.myAllVisitor);
  }
  });
}
//獲取更多訪客資料
visitorMore(visitorId :any){
  console.log(visitorId);
this.service.visitorId=visitorId;
this.service.permissions='residents';
this.openDialog();
}






  getVisitorData() {
    this.http.getApi('/visitor/getVisitor').subscribe((res: any) => {
      this.allVisitor = res;
      console.log(this.allVisitor);


    })
  }
}
