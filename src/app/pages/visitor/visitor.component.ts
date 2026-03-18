import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Visitor } from '../../interface/interface';


@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule, CommonModule,FormsModule],
  templateUrl: './visitor.component.html',
  styleUrl: './visitor.component.scss'
})
export class VisitorComponent {

  // ===== 訪客列表假資料 =====
  // TODO: 之後改成呼叫 GET /api/v1/visitors 取得真實資料
  visitors: Visitor[] = [
    { id: 1, name: '王小明', phone: '0912345678', hostUnit: 'A101', licensePlate: 'ABC-1234', checkInTime: '10:30', checkOutTime: '', status: '在內' },
    { id: 2, name: '李美華', phone: '0923456789', hostUnit: 'B205', licensePlate: '', checkInTime: '09:15', checkOutTime: '11:00', status: '已離' },
    { id: 3, name: '陳大文', phone: '0934567890', hostUnit: 'C308', licensePlate: 'XYZ-5678', checkInTime: '08:45', checkOutTime: '10:30', status: '已離' },
  ];

      // ===== 搜尋關鍵字 =====
  searchKeyword = '';

  // ===== 過濾後的訪客列表 =====
  // 根據搜尋關鍵字即時過濾，符合姓名、電話、門牌、車牌、時間其中一個就顯示
  get filteredVisitors(): Visitor[] {
    if (!this.searchKeyword.trim()) {
      return this.visitors; // 沒有關鍵字就顯示全部
    }
    const keyword = this.searchKeyword.toLowerCase();
    return this.visitors.filter(v =>
      v.name.toLowerCase().includes(keyword) ||
      v.phone.includes(keyword) ||
      v.hostUnit.toLowerCase().includes(keyword) ||
      v.licensePlate.toLowerCase().includes(keyword) ||
      v.checkInTime.includes(keyword) ||
      v.checkOutTime.includes(keyword)
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
      hostUnit: this.newVisitor.hostUnit,
      licensePlate: this.newVisitor.licensePlate,
      checkInTime: time,
      checkOutTime: '',
      status: '在內',
    });

    this.closeForm();
  }

  // ===== 訪客離開（更新狀態）=====
  // TODO: 之後改成呼叫 PUT /api/v1/visitors/{id}/checkout 更新後端資料
  checkOut(visitor: Visitor) {
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    visitor.checkOutTime = time;
    visitor.status = '已離';
  }
}
