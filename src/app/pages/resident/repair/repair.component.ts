import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RepairRequest, User } from '../../../interface/interface';
import { RepairStatus, UserRole } from '../../../interface/enum';
import { AuthService } from '../../../@service/auth.service';

@Component({
  selector: 'app-resident-repair',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './repair.component.html',
  styleUrl: './repair.component.scss'
})
export class ResidentRepairComponent implements OnInit {
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
    isActive: true,
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

  fakeResident: User = {
    userId: 0,
    userName: '住戶小王',
    passwordHash: '',
    fullName: '住戶小王',
    email: 'resident@email.com',
    phone: '0912345678',
    unitNumber: 'A101',
    role: UserRole.RESIDENT,
    isActive: true,
    createdAt: '2026-03-01'
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
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
        isActive: true,
        createdAt: payload.createdAt || new Date().toISOString(),
      };
      this.fakeResident = this.currentUser;
    }
  }

  repairs: RepairRequest[] = [
    { id: 1,  user: this.fakeResident, location: 'A棟電梯',    category: '電梯', description: '電梯門無法正常關閉',    status: RepairStatus.PENDING,     submittedAt: '2026-03-16', resolvedAt: '', handler: this.fakeResident, imageUrl: '' },
    { id: 2,  user: this.fakeResident, location: 'B棟2樓走廊', category: '水電', description: '走廊燈泡損壞，夜間昏暗', status: RepairStatus.IN_PROGRESS,  submittedAt: '2026-03-15', resolvedAt: '', handler: this.fakeResident, imageUrl: '' },
    { id: 3,  user: this.fakeResident, location: 'C棟地下室',  category: '水管', description: '水管漏水，地面積水',     status: RepairStatus.DONE,        submittedAt: '2026-03-14', resolvedAt: '2026-03-15', handler: this.fakeResident, imageUrl: '' },
  ];

  get filteredRepairs(): RepairRequest[] {
    const myRepairs = this.repairs.filter(r => r.user.userName === this.currentUser.userName);
    if (this.selectedFilter === '全部') return myRepairs;
    return myRepairs.filter(r => r.status === this.selectedFilter);
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
    if (!this.newRepair.location || !this.newRepair.description) return;
    this.repairs.unshift({
      id: this.repairs.length + 1,
      user: this.currentUser,
      location: this.newRepair.location,
      category: this.newRepair.category,
      description: this.newRepair.description,
      status: RepairStatus.PENDING,
      submittedAt: new Date().toLocaleDateString('zh-TW'),
      resolvedAt: '',
      handler: this.currentUser,
      imageUrl: '',
    });
    this.closeForm();
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
    this.selectedRepair.location = this.editForm.location;
    this.selectedRepair.category = this.editForm.category;
    this.selectedRepair.description = this.editForm.description;
    this.selectedRepair.status = this.editForm.status;
    this.closeEditForm();
  }

  deleteRepair(repair: RepairRequest) {
    this.repairs = this.repairs.filter(r => r.id !== repair.id);
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
    this.selectedRepair.status = RepairStatus.DONE;
    this.selectedRepair.resolvedAt = new Date().toLocaleDateString('zh-TW');
    this.selectedRepair.handler = {
      ...this.fakeResident,
      fullName: this.completeForm.handler
    };
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
}
