import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { RepairService } from '../../../@service/repair.service';
import { RepairStatus } from '../../../interface/enum';
import { RepairRequest } from '../../../interface/interface';
import { ToastService } from '../../../@service/toast.service';

@Component({
  selector: 'app-repair',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './repair.component.html',
  styleUrl: './repair.component.scss'
})
export class RepairComponent implements OnInit, OnDestroy {
  selectedFilter: '全部' | RepairStatus = '全部';

  currentPage = 1;
  pageSize = 5;

  showForm = false;
  showCompleteForm = false;
  showEditForm = false;
  selectedRepair: RepairRequest | null = null;

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

  repairs: RepairRequest[] = [];

  private toast = inject(ToastService);
  private destroy$ = new Subject<void>();

  constructor(private repairService: RepairService) {}

  ngOnInit(): void {
    this.repairService.getAll().subscribe();

    this.repairService.repairs$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.repairs = data.map(repair => this.normalizeRepair(repair));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private normalizeRepair(repair: any): RepairRequest {
    return {
      ...repair,
      repairId: repair.repairId ?? repair.id,
      userName: repair.userName || repair.user?.fullName || '',
      submittedAt: repair.submittedAt || repair.createdAt || '',
      resolvedAt: repair.resolvedAt || repair.completedAt || '',
      handlerName: repair.handlerName || repair.handler?.fullName || repair.handler || '',
      note: repair.note || repair.remark || '',
      imageUrl: repair.imageUrl || ''
    };
  }

  get filteredRepairs(): RepairRequest[] {
    if (this.selectedFilter === '全部') return this.repairs;
    return this.repairs.filter(r => r.status === this.selectedFilter);
  }

  get pagedRepairs(): RepairRequest[] {
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
    this.currentPage = 1;
  }

  get pendingCount(): number { return this.repairs.filter(r => r.status === RepairStatus.PENDING).length; }
  get processingCount(): number { return this.repairs.filter(r => r.status === RepairStatus.IN_PROGRESS).length; }
  get doneCount(): number { return this.repairs.filter(r => r.status === RepairStatus.DONE).length; }

  openForm() { this.showForm = true; }

  closeForm() {
    this.showForm = false;
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

    this.repairService.updateById(this.selectedRepair.repairId, data).subscribe();
    this.closeEditForm();
  }

  deleteRepair(repair: RepairRequest) {
    if (confirm('確定要刪除此維修單嗎？')) {
      this.repairService.deleteById(repair.repairId).subscribe(() => {
        this.toast.success('維修單已成功刪除', 2000);
      });
    }

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

    this.repairService.completeById(this.selectedRepair.repairId, {
      handler: this.completeForm.handler,
      note: this.completeForm.note
    }).subscribe();

    this.closeCompleteForm();
  }

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

  RepairStatus = RepairStatus;
  protected Math = Math;
}
