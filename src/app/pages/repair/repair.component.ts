import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RepairRequest, User } from '../../interface/interface';
import { RepairStatus, UserRole } from '../../interface/enum';


@Component({
  selector: 'app-repair',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './repair.component.html',
  styleUrl: './repair.component.scss'
})
export class RepairComponent {

  // ===== 目前篩選狀態 =====
  selectedFilter: '全部' | '待處理' | '處理中' | '已完工' = '全部';

  // ===== 控制表單顯示 =====
  showForm = false;

  // ===== 控制完工回報表單 =====
  showCompleteForm = false;
  selectedRepair: RepairRequest | null = null;

  // ===== 新增報修表單資料 =====
  newRepair = {
    location: '',
    category: '水電',
    description: '',
  };

  // ===== 完工回報表單資料 =====
  completeForm = {
    handler: '',
    note: '',
  };

  // ===== 報修假資料 =====
  // TODO: 之後改成呼叫 GET /api/v1/repairs 取得真實資料
  fakeAdmin: User = {
    userId: 0,
    userName: '假資料人',
    passwordHash: 'qweradsgfshrtws',
    fullName: '假資料人',
    email: 'fake@email.com',
    phone: '0987654321',
    unitNumber: '假樓假住戶',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date().toLocaleDateString('zh-TW')
  };
  repairs: RepairRequest[] = [
    { id: 1, location: 'A棟電梯', category: '電梯', description: '電梯門無法正常關閉', status: RepairStatus.IN_PROGRESS, submittedAt: '2026-03-16', resolvedAt: '', handler: this.fakeAdmin, note: '' },
    { id: 2, location: 'B棟2樓走廊', category: '水電', description: '走廊燈泡損壞，夜間昏暗', status: RepairStatus.DONE, submittedAt: '2026-03-15', resolvedAt: '', handler: this.fakeAdmin, note: '' },
    { id: 3, location: 'C棟地下室', category: '水管', description: '水管漏水，地面積水', status: RepairStatus.IN_PROGRESS, submittedAt: '2026-03-14', resolvedAt: '2026-03-15', handler: this.fakeAdmin, note: '已更換破損水管，問題解決' },
    { id: 4, location: '社區大門', category: '門禁', description: '門禁感應器故障', status: RepairStatus.PENDING, submittedAt: '2026-03-13', resolvedAt: '', handler: this.fakeAdmin, note: '' },
  ];

  // ===== 根據篩選條件過濾 =====
  get filteredRepairs(): RepairRequest[] {
    if (this.selectedFilter === '全部') return this.repairs;
    return this.repairs.filter(r => r.status === this.selectedFilter);
  }

  // ===== 各狀態數量 =====
  get pendingCount(): number { return this.repairs.filter(r => r.status === RepairStatus.PENDING).length; }
  get processingCount(): number { return this.repairs.filter(r => r.status === RepairStatus.IN_PROGRESS).length; }
  get doneCount(): number { return this.repairs.filter(r => r.status === RepairStatus.DONE).length; }

  // ===== 開關新增表單 =====
  openForm() { this.showForm = true; }
  closeForm() {
    this.showForm = false;
    this.newRepair = { location: '', category: '水電', description: '' };
  }

  // ===== 提交報修單 =====
  // TODO: 之後改成呼叫 POST /api/v1/repairs
  submitRepair() {
    if (!this.newRepair.location || !this.newRepair.description) return;
    this.repairs.unshift({
      id: this.repairs.length + 1,
      location: this.newRepair.location,
      category: this.newRepair.category,
      description: this.newRepair.description,
      status: '待處理',
      submittedAt: new Date().toLocaleDateString('zh-TW'),
      resolvedAt: '',
      handler: '',
      note: '',
    });
    this.closeForm();
  }

  // ===== 開關完工回報表單 =====
  openCompleteForm(repair: RepairRequest) {
    this.selectedRepair = repair;
    this.showCompleteForm = true;
  }
  closeCompleteForm() {
    this.showCompleteForm = false;
    this.selectedRepair = null;
    this.completeForm = { handler: '', note: '' };
  }

  // ===== 完工回報 =====
  // TODO: 之後改成呼叫 PUT /api/v1/repairs/{id}
  submitComplete() {
    if (!this.selectedRepair || !this.completeForm.handler) return;
    this.selectedRepair.status = RepairStatus.DONE;
    this.selectedRepair.resolvedAt = new Date().toLocaleDateString('zh-TW');
    this.selectedRepair.handler = this.completeForm.handler;
    this.selectedRepair.note = this.completeForm.note;
    this.closeCompleteForm();
  }

  // ===== 分類對應 icon =====
  getCategoryIcon(category: string): string {
    switch (category) {
      case '水電': return 'bolt';
      case '水管': return 'water_drop';
      case '電梯': return 'elevator';
      case '門禁': return 'door_front';
      default: return 'build';
    }
  }
}
