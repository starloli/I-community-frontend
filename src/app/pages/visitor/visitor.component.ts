import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HttpParams } from '@angular/common/http';

// 訪客資料的型別定義
// interface Visitor {
//   id: number;
//   visitorName: string;        // 訪客姓名
//   visitorPhone: string;       // 訪客電話
//   purpose:string;//訪客來訪目的
//   residentialAddress: string;    // 被訪住戶門牌
// residentName:string;//住戶名字
//   licensePlate: string; // 車牌號碼
//   checkInTime: string; // 進入時間
//   checkOutTime: string; // 離開時間
//   status: '在內' | '已離'; // 目前狀態
// }

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule, CommonModule, FormsModule],
  templateUrl: './visitor.component.html',
  styleUrl: './visitor.component.scss'
})
export class VisitorComponent {




  constructor(private http: ApiService) { }
residents: any[] = [];
myVisitors:any[]=[];
  //獲取api


  allVisitor!: any;
  // ===== 訪客列表假資料 =====
  // TODO: 之後改成呼叫 GET /api/v1/visitors 取得真實資料
  visitors: any[] = [
    { id: 1, name: '王小明', phone: '0912345678', residentialAddress: 'A101', licensePlate: 'ABC-1234', checkInTime: '10:30', checkOutTime: '', status: '在內' },
    { id: 2, name: '李美華', phone: '0923456789', residentialAddress: 'B205', licensePlate: '', checkInTime: '09:15', checkOutTime: '11:00', status: '已離' },
    { id: 3, name: '陳大文', phone: '0934567890', residentialAddress: 'C308', licensePlate: 'XYZ-5678', checkInTime: '08:45', checkOutTime: '10:30', status: '已離' },
  ];


  getVisitorData() {
    this.http.getApi('/visitor/getVisitor').subscribe((res: any) => {
      this.allVisitor = res;
      console.log(this.allVisitor);


    })
  }


  // ===== 搜尋關鍵字 =====
  searchKeyword = '';

  // ===== 過濾後的訪客列表 =====
  // 根據搜尋關鍵字即時過濾，符合姓名、電話、門牌、車牌、時間其中一個就顯示
  get filteredVisitors() {
    if (!this.searchKeyword.trim()) {
      return this.allVisitor; // 沒有關鍵字就顯示全部
    }
    const keyword = this.searchKeyword.toLowerCase();
    return this.allVisitor.filter((v: any) =>
      (v.visitorName?.toLowerCase().includes(keyword)) ||
      (v.visitorPhone?.includes(keyword)) ||
      (v.residentialAddress?.toLowerCase().includes(keyword)) ||
      (v.licensePlate?.toLowerCase().includes(keyword)) ||
      (v.checkInTime?.includes(keyword)) ||
      (v.checkOutTime?.includes(keyword))
      // || (v.residentName?.includes(keyword))
    );
  }

  // ===== 控制新增表單是否顯示 =====
  showForm = false;

  // ===== 新增訪客的表單資料 =====
  newVisitor = {
    name: '',
    phone: '',
    hostUnit: '',
    licensePlate: '',
  };


  // 開啟新增表單
  openForm() {
    this.showForm = true;
  }

  // 關閉新增表單並清空欄位
  closeForm() {
    this.showForm = false;
    this.newVisitor = { name: '', phone: '', hostUnit: '', licensePlate: '' };
  }

  // ===== 新增訪客 =====
  // TODO: 之後改成呼叫 POST /api/v1/visitors 送出資料到後端
  addVisitor() {
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 把新訪客加入列表最前面
    this.visitors.unshift({
      id: this.visitors.length + 1,
      name: this.newVisitor.name,
      phone: this.newVisitor.phone,
      residentialAddress: this.newVisitor.hostUnit,
      licensePlate: this.newVisitor.licensePlate,
      checkInTime: time,
      checkOutTime: '',
      status: '在內',
    });

    this.closeForm();
  }

  // ===== 訪客離開（更新狀態）=====
  // TODO: 之後改成呼叫 PUT /api/v1/visitors/{id}/checkout 更新後端資料
  checkOut(left: any) {
    console.log(left);

    this.http.putApi("/visitor/checkOut/" + left).subscribe((res: any) => {
      console.log(res);
      this.getVisitorData();
    })

  }
















  ad: string = "A棟701樓908F";

getResidentData(address: string) {
  console.log('開始查詢地址:', address);

  // 修正：補上路徑，並使用 encodeURIComponent 處理中文字
  const url = `/visitor/by-address?address=${encodeURIComponent(address)}`;

  this.http.getApi(url).subscribe({
    next: (data: any) => {
      this.residents = data;
      console.log('查詢成功，收到資料:', data);
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
      console.log('後端回傳的原始資料:', res); // 👈 這是最重要的 Debug 行

      if (Array.isArray(res)) {
        this.myVisitors = res;
      } else if (res && Array.isArray(res.data)) {
        this.myVisitors = res.data;
      } else {
        this.myVisitors = [];
      }
    },
    error: (err) => {
      console.error('API 請求失敗:', err);
    }
  });
}
}
