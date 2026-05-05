import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RepairRequest, User } from '../../../interface/interface';
import { RepairStatus, UserRole, UserStatus } from '../../../interface/enum';
import { AuthService } from '../../../@service/auth.service';
import { RepairService } from '../../../@service/repair.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../@service/toast.service';

@Component({
  selector: 'app-resident-repair',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './repair.component.html',
  styleUrl: './repair.component.scss'
})
export class ResidentRepairComponent implements OnInit {
  // 目前列表的篩選條件，預設顯示全部資料。
  selectedFilter: '全部' | RepairStatus = '全部';
  currentPage = 1;
  pageSize = 5;
  showForm = false;
  showCompleteForm = false;
  showEditForm = false;
  selectedRepair: RepairRequest | null = null;

  currentUser: User = {
    userId: 0,
    userName: 'resident',
    passwordHash: '',
    fullName: '住戶',
    email: '',
    phone: '',
    unitNumber: '',
    role: UserRole.RESIDENT,
    status: UserStatus.ACTIVE,
    createdAt: new Date().toISOString(),
  };

  newRepair = {
    location: '',
    category: '水電',
    description: '',
  };

  editForm = {
    location: '',
    category: '水電',
    description: '',
    status: RepairStatus.PENDING as RepairStatus,
  };

  completeForm = {
    handler: '',
    note: '',
  };

  // 目前僅作為前端暫存使用的住戶資料。
  fakeResident: User = {
    userId: 0,
    userName: '住戶帳號',
    passwordHash: '',
    fullName: '住戶帳號',
    email: 'resident@email.com',
    phone: '0912345678',
    unitNumber: 'A101',
    role: UserRole.RESIDENT,
    status: UserStatus.ACTIVE,
    createdAt: '2026-03-01'
  };

  // 元件銷毀時用來停止訂閱。
  private destroy$ = new Subject<void>();
  repairs: RepairRequest[] = [];

  constructor(
    private authService: AuthService,
    private repairService: RepairService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    // 從登入資訊取得目前住戶資料，供畫面顯示與後續流程使用。
    const payload = this.authService.getUser();
    if (payload) {
      this.currentUser = {
        userId: payload.userId || 0,
        userName: payload.userName || payload.sub || '住戶',
        passwordHash: '',
        fullName: payload.fullName || payload.name || '住戶',
        email: payload.email || '',
        phone: payload.phone || '',
        unitNumber: payload.unitNumber || '',
        role: payload.role === 'ADMIN' ? UserRole.ADMIN : UserRole.RESIDENT,
        status: UserStatus.ACTIVE,
        createdAt: payload.createdAt || new Date().toISOString(),
      };
      this.fakeResident = this.currentUser;
    }

    // 載入住戶自己的報修列表。
    this.repairService.getUserAll().subscribe();

    // 訂閱報修資料流，讓畫面能隨資料更新同步刷新。
    this.repairService.userRepairs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.repairs = data;
        console.log(data);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredRepairs(): RepairRequest[] {
    // 依照目前篩選條件過濾報修資料。
    const myRepairs = this.repairs;
    if (this.selectedFilter === '全部') return myRepairs;
    return myRepairs.filter(r => r.status === this.selectedFilter);
  }

  get pagedRepairs(): RepairRequest[] {
    // 從篩選後的資料中切出當前頁要顯示的筆數。
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredRepairs.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRepairs.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  setFilter(filter: '全部' | RepairStatus) {
    this.selectedFilter = filter;
    // 切換篩選時回到第一頁，避免出現空白頁面。
    this.currentPage = 1;
  }

  get pendingCount(): number { return this.repairs.filter(r => r.status === RepairStatus.PENDING).length; }
  get processingCount(): number { return this.repairs.filter(r => r.status === RepairStatus.IN_PROGRESS).length; }
  get doneCount(): number { return this.repairs.filter(r => r.status === RepairStatus.DONE).length; }

  openForm() { this.showForm = true; }

  closeForm() {
    this.showForm = false;
    // 關閉新增表單時一併重設欄位內容。
    this.newRepair = { location: '', category: '水電', description: '' };
  }

  submitRepair() {
    // 地點與描述為必填，缺少任一欄位就不送出。
    if (!this.newRepair.location || !this.newRepair.description) {
      this.toast.warning('請先填寫完整報修資訊', 2000);
      return;
    }

    // 組出新增報修要送往後端的資料。
    const newRep = {
      location: this.newRepair.location,
      category: this.newRepair.category,
      description: this.newRepair.description,
      submittedAt: new Date().toLocaleDateString('zh-TW')
    };

    this.repairService.post(newRep).subscribe({
      next: (res) => {
        console.log(res);
        this.toast.success('報修新增成功', 2000);
        this.closeForm();
      },
      error: (error) => {
        console.error('報修新增失敗:', error);
        const message =
          error?.error?.message ||
          (error?.status ? `報修新增失敗（${error.status}）` : '報修新增失敗，請稍後再試');
        this.toast.error(message, 3000);
      }
    });
  }

  openEditForm(repair: RepairRequest) {
    this.selectedRepair = repair;

    // 將選中的報修資料帶入編輯表單。
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

  submitEdit() {
    if (!this.selectedRepair || !this.editForm.location || !this.editForm.description) return;

    // 目前先直接更新前端畫面中的資料。
    this.selectedRepair.location = this.editForm.location;
    this.selectedRepair.category = this.editForm.category;
    this.selectedRepair.description = this.editForm.description;
    this.selectedRepair.status = this.editForm.status;
    this.closeEditForm();
  }

  deleteRepair(repair: RepairRequest) {
    // 先從前端列表移除指定報修單。
    this.repairs = this.repairs.filter(r => r.repairId !== repair.repairId);

    // 若刪除後本頁沒有資料，則自動退回前一頁。
    if (this.pagedRepairs.length === 0 && this.currentPage > 1) {
      this.currentPage--;
    }
  }

  openCompleteForm(repair: RepairRequest) {
    this.selectedRepair = repair;
    this.showCompleteForm = true;
  }

  closeCompleteForm() {
    this.showCompleteForm = false;
    this.selectedRepair = null;
    this.completeForm = { handler: '', note: '' };
  }

  submitComplete() {
    if (!this.selectedRepair || !this.completeForm.handler) return;

    // 目前先在前端將報修狀態改為完工。
    this.selectedRepair.status = RepairStatus.DONE;
    this.selectedRepair.resolvedAt = new Date().toLocaleDateString('zh-TW');
    /*this.selectedRepair.handler = {
      ...this.fakeResident,
      fullName: this.completeForm.handler
    };*/
    this.closeCompleteForm();
  }

  getCategoryIcon(category: string): string {
    // 依報修分類回傳對應的 Material icon 名稱。
    switch (category) {
      case '水電': return 'bolt';
      case '水管': return 'water_drop';
      case '電梯': return 'elevator';
      case '門禁': return 'door_front';
      case '照明': return 'light';
      default: return 'build';
    }
  }

  RepairStatus = RepairStatus;
}
