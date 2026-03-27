import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RepairRequest, User } from '../../interface/interface';
import { RepairStatus, UserRole } from '../../interface/enum';
import { RepairService } from '../../@service/repair.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

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

  repairs: RepairRequest[] = [];
  private snackBar = inject(MatSnackBar);

  constructor(
    private repairService: RepairService
  ) {}

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

  ngOnInit(): void {
    // 先呼叫 API 抓資料
    this.repairService.getAll().subscribe();

    // 訂閱資料流
    this.repairService.repairs$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.repairs = data;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  private destroy$ = new Subject<void>();

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
    /*this.repairs.unshift({
      repairId: this.repairs.length + 1,
      user: this.fakeAdmin,  // 加這行
      location: this.newRepair.location,
      category: this.newRepair.category,
      description: this.newRepair.description,
      status: RepairStatus.PENDING,
      submittedAt: new Date().toLocaleDateString('zh-TW'),
      resolvedAt: '',
      handler: this.fakeAdmin,
      imageUrl: '',
    });*/
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

  submitEdit() {
    if (!this.selectedRepair || !this.editForm.location || !this.editForm.description) return;
    const data = {
      location: this.editForm.location,
      category: this.editForm.category,
      description: this.editForm.description,
      status: this.editForm.status
    };
    this.repairService.updateById(this.selectedRepair.repairId, data).subscribe(res => console.log(res))
    this.closeEditForm();
  }

  deleteRepair(repair: RepairRequest) {
    if (confirm(`確定要刪除此維修單嗎？`)) {
      this.repairService.deleteById(repair.repairId).subscribe(() => {
        this.snackBar.open('維修單已成功刪除', '關閉', { duration: 2000 });
      });
    }
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

  submitComplete() {
    if (!this.selectedRepair || !this.completeForm.handler) return;
    this.repairService.completeById(this.selectedRepair.repairId).subscribe(res => console.log(res))
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
