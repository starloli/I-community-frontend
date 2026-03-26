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

  // ===== 篩選狀態 =====
  selectedFilter: '全部' | RepairStatus = '全部';

  // ===== 分頁設定 =====
  currentPage = 1;
  pageSize = 5;

  // ===== 表單控制 =====
  showForm = false;
  showCompleteForm = false;
  showEditForm = false;
  selectedRepair: RepairRequest | null = null;

  // ===== 新增表單資料 =====
  newRepair = {
    location: '',
    category: '水電',
    description: '',
  };

  // ===== 編輯表單資料 =====
  editForm = {
    location: '',
    category: '水電',
    description: '',
    status: RepairStatus.PENDING as RepairStatus,
  };

  // ===== 完工回報表單資料 =====
  completeForm = {
    handler: '',
    note: '',
  };

  // ===== 假資料用的 User =====
  fakeAdmin: User = {
    userId: 0,
    userName: '假資料人',
    passwordHash: '',
    fullName: '假資料人',
    email: 'fake@email.com',
    phone: '0987654321',
    unitNumber: 'A101',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: '2026-03-01'
  };

  // ===== 假資料 =====
  // TODO: 之後改成呼叫 GET /api/v1/repairs 取得真實資料
  repairs: RepairRequest[] = [
    { id: 1, user: this.fakeAdmin, location: 'A棟電梯', category: '電梯', description: '電梯門無法正常關閉', status: RepairStatus.PENDING, submittedAt: '2026-03-16', resolvedAt: '', handler: this.fakeAdmin, imageUrl: '' },
    { id: 2, user: this.fakeAdmin, location: 'B棟2樓走廊', category: '水電', description: '走廊燈泡損壞，夜間昏暗', status: RepairStatus.IN_PROGRESS, submittedAt: '2026-03-15', resolvedAt: '', handler: this.fakeAdmin, imageUrl: '' },
    { id: 3, user: this.fakeAdmin, location: 'C棟地下室', category: '水管', description: '水管漏水，地面積水', status: RepairStatus.DONE, submittedAt: '2026-03-14', resolvedAt: '2026-03-15', handler: this.fakeAdmin, imageUrl: '' },
    { id: 4, user: this.fakeAdmin, location: '社區大門', category: '門禁', description: '門禁感應器故障', status: RepairStatus.PENDING, submittedAt: '2026-03-13', resolvedAt: '', handler: this.fakeAdmin, imageUrl: '' },
    { id: 5, user: this.fakeAdmin, location: 'A棟1樓', category: '水電', description: '插座無法使用', status: RepairStatus.PENDING, submittedAt: '2026-03-12', resolvedAt: '', handler: this.fakeAdmin, imageUrl: '' },
    { id: 6, user: this.fakeAdmin, location: 'B棟停車場', category: '照明', description: '停車場照明故障', status: RepairStatus.IN_PROGRESS, submittedAt: '2026-03-11', resolvedAt: '', handler: this.fakeAdmin, imageUrl: '' },
    { id: 7, user: this.fakeAdmin, location: 'C棟頂樓', category: '水管', description: '屋頂漏水', status: RepairStatus.DONE, submittedAt: '2026-03-10', resolvedAt: '2026-03-12', handler: this.fakeAdmin, imageUrl: '' },
    { id: 8, user: this.fakeAdmin, location: 'A棟2樓', category: '其他', description: '走廊地板破損', status: RepairStatus.PENDING, submittedAt: '2026-03-09', resolvedAt: '', handler: this.fakeAdmin, imageUrl: '' },
    { id: 9, user: this.fakeAdmin, location: '社區游泳池', category: '其他', description: '游泳池排水孔堵塞', status: RepairStatus.IN_PROGRESS, submittedAt: '2026-03-08', resolvedAt: '', handler: this.fakeAdmin, imageUrl: '' },
    { id: 10, user: this.fakeAdmin, location: 'B棟大廳', category: '電梯', description: '電梯按鈕故障', status: RepairStatus.DONE, submittedAt: '2026-03-07', resolvedAt: '2026-03-09', handler: this.fakeAdmin, imageUrl: '' },
    { id: 11, user: this.fakeAdmin, location: 'A棟地下室', category: '水電', description: '配電箱跳電', status: RepairStatus.PENDING, submittedAt: '2026-03-06', resolvedAt: '', handler: this.fakeAdmin, imageUrl: '' },
    { id: 12, user: this.fakeAdmin, location: 'C棟2樓', category: '門禁', description: '門禁卡片無法感應', status: RepairStatus.PENDING, submittedAt: '2026-03-05', resolvedAt: '', handler: this.fakeAdmin, imageUrl: '' },
  ];
  // ===== 篩選後資料 =====
  get filteredRepairs(): RepairRequest[] {
    if (this.selectedFilter === '全部') return this.repairs;
    return this.repairs.filter(r => r.status === this.selectedFilter);
  }

  // ===== 分頁後資料 =====
  get pagedRepairs(): RepairRequest[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRepairs.slice(start, start + this.pageSize);
  }

  // ===== 總頁數 =====
  get totalPages(): number {
    return Math.ceil(this.filteredRepairs.length / this.pageSize);
  }

  // ===== 頁碼陣列 =====
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ===== 切換頁碼 =====
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ===== 切換篩選 =====
  setFilter(filter: '全部' | RepairStatus) {
    this.selectedFilter = filter;
    this.currentPage = 1;
  }

  // ===== 統計 =====
  get pendingCount(): number { return this.repairs.filter(r => r.status === RepairStatus.PENDING).length; }
  get processingCount(): number { return this.repairs.filter(r => r.status === RepairStatus.IN_PROGRESS).length; }
  get doneCount(): number { return this.repairs.filter(r => r.status === RepairStatus.DONE).length; }

  // ===== 新增報修 =====
  openForm() { this.showForm = true; }
  closeForm() {
    this.showForm = false;
    this.newRepair = { location: '', category: '水電', description: '' };
  }

  // TODO: 之後改成呼叫 POST /api/v1/repairs
  submitRepair() {
    if (!this.newRepair.location || !this.newRepair.description) return;
    this.repairs.unshift({
      id: this.repairs.length + 1,
      user: this.fakeAdmin,  // 加這行
      location: this.newRepair.location,
      category: this.newRepair.category,
      description: this.newRepair.description,
      status: RepairStatus.PENDING,
      submittedAt: new Date().toLocaleDateString('zh-TW'),
      resolvedAt: '',
      handler: this.fakeAdmin,
      imageUrl: '',
    });
    this.closeForm();
  }

  // ===== 編輯報修 =====
  openEditForm(repair: RepairRequest) {
    this.selectedRepair = repair;
    this.editForm = {
      location: repair.location,
      category: repair.category,
      description: repair.description,
      status: repair.status,
    };
    this.showEditForm = true;
  }

  closeEditForm() {
    this.showEditForm = false;
    this.selectedRepair = null;
  }

  // TODO: 之後改成呼叫 PUT /api/v1/repairs/{id}
  submitEdit() {
    if (!this.selectedRepair || !this.editForm.location || !this.editForm.description) return;
    this.selectedRepair.location = this.editForm.location;
    this.selectedRepair.category = this.editForm.category;
    this.selectedRepair.description = this.editForm.description;
    this.selectedRepair.status = this.editForm.status;
    this.closeEditForm();
  }

  // ===== 刪除報修 =====
  // TODO: 之後改成呼叫 DELETE /api/v1/repairs/{id}
  deleteRepair(repair: RepairRequest) {
    this.repairs = this.repairs.filter(r => r.id !== repair.id);
    if (this.pagedRepairs.length === 0 && this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ===== 完工回報 =====
  openCompleteForm(repair: RepairRequest) {
    this.selectedRepair = repair;
    this.showCompleteForm = true;
  }

  closeCompleteForm() {
    this.showCompleteForm = false;
    this.selectedRepair = null;
    this.completeForm = { handler: '', note: '' };
  }

  // TODO: [後端小夥伴看這裡]
  // 1. 維修完工回報：PUT /admin/repair/{id}/complete
  submitComplete() {
    if (!this.selectedRepair || !this.completeForm.handler) return;
    this.selectedRepair.status = RepairStatus.DONE;
    this.selectedRepair.resolvedAt = new Date().toLocaleDateString('zh-TW');
    this.selectedRepair.handler = {
      ...this.fakeAdmin,
      fullName: this.completeForm.handler
    };
    this.closeCompleteForm();
  }

  // ===== 分類 icon =====
  getCategoryIcon(category: string): string {
    switch (category) {
      case '水電': return 'bolt';
      case '水管': return 'water_drop';
      case '電梯': return 'elevator';
      case '門禁': return 'door_front';
      case '照明': return 'light';
      default: return 'build';
    }
  }

  // ===== 讓 HTML 可以使用 RepairStatus enum =====
  RepairStatus = RepairStatus;
}
