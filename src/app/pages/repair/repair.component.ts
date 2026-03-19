import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RepairRequest } from '../../interface/interface';

@Component({
  selector: 'app-repair',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './repair.component.html',
  styleUrl: './repair.component.scss'
})
export class RepairComponent {

  // ===== 篩選狀態 =====
  selectedFilter: '全部' | '待處理' | '處理中' | '已完工' = '全部';

  // ===== 分頁設定 =====
  currentPage = 1;
  pageSize = 5; // 每頁顯示幾筆

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
    status: '待處理' as '待處理' | '處理中' | '已完工',
  };

  // ===== 完工回報表單資料 =====
  completeForm = {
    handler: '',
    note: '',
  };

  // ===== 假資料 =====
  // TODO: 之後改成呼叫 GET /api/v1/repairs 取得真實資料
  repairs: RepairRequest[] = [
    { id: 1,  location: 'A棟電梯',    category: '電梯', description: '電梯門無法正常關閉',   status: '待處理', submittedAt: '2026-03-16', resolvedAt: '', handler: '',    note: '' },
    { id: 2,  location: 'B棟2樓走廊', category: '水電', description: '走廊燈泡損壞，夜間昏暗', status: '處理中', submittedAt: '2026-03-15', resolvedAt: '', handler: '王技師', note: '' },
    { id: 3,  location: 'C棟地下室',  category: '水管', description: '水管漏水，地面積水',    status: '已完工', submittedAt: '2026-03-14', resolvedAt: '2026-03-15', handler: '李技師', note: '已更換破損水管' },
    { id: 4,  location: '社區大門',   category: '門禁', description: '門禁感應器故障',       status: '待處理', submittedAt: '2026-03-13', resolvedAt: '', handler: '',    note: '' },
    { id: 5,  location: 'A棟1樓',    category: '水電', description: '插座無法使用',         status: '待處理', submittedAt: '2026-03-12', resolvedAt: '', handler: '',    note: '' },
    { id: 6,  location: 'B棟停車場', category: '照明', description: '停車場照明故障',        status: '處理中', submittedAt: '2026-03-11', resolvedAt: '', handler: '陳技師', note: '' },
    { id: 7,  location: 'C棟頂樓',   category: '水管', description: '屋頂漏水',             status: '已完工', submittedAt: '2026-03-10', resolvedAt: '2026-03-12', handler: '王技師', note: '已修補防水層' },
    { id: 8,  location: 'A棟2樓',    category: '其他', description: '走廊地板破損',         status: '待處理', submittedAt: '2026-03-09', resolvedAt: '', handler: '',    note: '' },
    { id: 9,  location: '社區游泳池', category: '其他', description: '游泳池排水孔堵塞',     status: '處理中', submittedAt: '2026-03-08', resolvedAt: '', handler: '李技師', note: '' },
    { id: 10, location: 'B棟大廳',   category: '電梯', description: '電梯按鈕故障',         status: '已完工', submittedAt: '2026-03-07', resolvedAt: '2026-03-09', handler: '陳技師', note: '已更換按鈕模組' },
    { id: 11, location: 'A棟地下室', category: '水電', description: '配電箱跳電',           status: '待處理', submittedAt: '2026-03-06', resolvedAt: '', handler: '',    note: '' },
    { id: 12, location: 'C棟2樓',    category: '門禁', description: '門禁卡片無法感應',     status: '待處理', submittedAt: '2026-03-05', resolvedAt: '', handler: '',    note: '' },
  ];

  // ===== 篩選後的資料 =====
  get filteredRepairs(): RepairRequest[] {
    if (this.selectedFilter === '全部') return this.repairs;
    return this.repairs.filter(r => r.status === this.selectedFilter);
  }

  // ===== 分頁後的資料 =====
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

  // ===== 切換篩選時重設頁碼 =====
  setFilter(filter: '全部' | '待處理' | '處理中' | '已完工') {
    this.selectedFilter = filter;
    this.currentPage = 1;
  }

  // ===== 統計 =====
  get pendingCount(): number { return this.repairs.filter(r => r.status === '待處理').length; }
  get processingCount(): number { return this.repairs.filter(r => r.status === '處理中').length; }
  get doneCount(): number { return this.repairs.filter(r => r.status === '已完工').length; }

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
      location: this.newRepair.location,
      category: this.newRepair.category,
      description: this.newRepair.description,
      status: '待處理',
      submittedAt: new Date().toLocaleDateString('zh-TW'),
      resolvedAt: '', handler: '', note: '',
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
    // 如果刪除後當前頁沒有資料，回到上一頁
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

  // TODO: 之後改成呼叫 PUT /api/v1/repairs/{id}
  submitComplete() {
    if (!this.selectedRepair || !this.completeForm.handler) return;
    this.selectedRepair.status = '已完工';
    this.selectedRepair.resolvedAt = new Date().toLocaleDateString('zh-TW');
    this.selectedRepair.handler = this.completeForm.handler;
    this.selectedRepair.note = this.completeForm.note;
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
}
