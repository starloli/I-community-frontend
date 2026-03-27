import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Visitor, User } from '../../../interface/interface';
import { VisitorStatus, UserRole } from '../../../interface/enum';

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule, CommonModule, FormsModule],
  templateUrl: './visitor.component.html',
  styleUrl: './visitor.component.scss'
})
export class VisitorComponent {

  // ===== 假資料用的 User =====
  fakeHost: User = {
    userId: 1,
    userName: 'resident1',
    passwordHash: '',
    fullName: '假住戶',
    email: 'fake@email.com',
    phone: '0912345678',
    unitNumber: 'A101',
    role: UserRole.RESIDENT,
    isActive: true,
    createdAt: '2026-03-01'
  };

  // ===== 訪客列表假資料 =====
  // TODO: 之後改成呼叫 GET /api/v1/visitors 取得真實資料
  visitors: Visitor[] = [
    { id: 1, visitorName: '王小明', visitorPhone: '0912345678', licensePlate: 'ABC-1234', hostUser: this.fakeHost, purpose: '拜訪', checkInTime: '10:30', checkOutTime: '',      status: VisitorStatus.INSIDE },
    { id: 2, visitorName: '李美華', visitorPhone: '0923456789', licensePlate: '',          hostUser: this.fakeHost, purpose: '送貨', checkInTime: '09:15', checkOutTime: '11:00', status: VisitorStatus.LEFT },
    { id: 3, visitorName: '陳大文', visitorPhone: '0934567890', licensePlate: 'XYZ-5678', hostUser: this.fakeHost, purpose: '維修', checkInTime: '08:45', checkOutTime: '10:30', status: VisitorStatus.LEFT },
  ];

  // ===== 搜尋關鍵字 =====
  searchKeyword = '';

  // ===== 過濾後的訪客列表 =====
  get filteredVisitors(): Visitor[] {
    if (!this.searchKeyword.trim()) return this.visitors;
    const keyword = this.searchKeyword.toLowerCase();
    return this.visitors.filter(v =>
      v.visitorName.toLowerCase().includes(keyword) ||
      v.visitorPhone.includes(keyword) ||
      v.hostUser.unitNumber.toLowerCase().includes(keyword) ||
      v.licensePlate.toLowerCase().includes(keyword) ||
      v.checkInTime.includes(keyword) ||
      v.checkOutTime.includes(keyword)
    );
  }

  // ===== 控制新增表單 =====
  showForm = false;

  newVisitor = {
    visitorName: '',
    visitorPhone: '',
    unitNumber: '',
    licensePlate: '',
    purpose: '',
  };

  openForm() { this.showForm = true; }

  closeForm() {
    this.showForm = false;
    this.newVisitor = { visitorName: '', visitorPhone: '', unitNumber: '', licensePlate: '', purpose: '' };
  }

  // ===== 新增訪客 =====
  // TODO: 之後改成呼叫 POST /api/v1/visitors
  addVisitor() {
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.visitors.unshift({
      id: this.visitors.length + 1,
      visitorName: this.newVisitor.visitorName,
      visitorPhone: this.newVisitor.visitorPhone,
      licensePlate: this.newVisitor.licensePlate,
      hostUser: { ...this.fakeHost, unitNumber: this.newVisitor.unitNumber },
      purpose: this.newVisitor.purpose,
      checkInTime: time,
      checkOutTime: '',
      status: VisitorStatus.INSIDE,
    });
    this.closeForm();
  }

  // ===== 訪客離開 =====
  // TODO: 之後改成呼叫 PUT /api/v1/visitors/{id}/checkout
  checkOut(visitor: Visitor) {
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    visitor.checkOutTime = time;
    visitor.status = VisitorStatus.LEFT;
  }

  // 讓 HTML 可以使用 enum
  VisitorStatus = VisitorStatus;
}
