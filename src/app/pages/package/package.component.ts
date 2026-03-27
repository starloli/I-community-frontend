import { PackageService } from './../../@service/package.service';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../@service/api.service';
import {  Res, User } from '../../interface/interface';
import { PackageStatus, UserRole } from '../../interface/enum';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-package',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.scss']
})
export class PackageComponent implements OnInit {

  // TODO: 從 localStorage 取得當前使用者
  // const raw = localStorage.getItem('user');
  // this.currentUser = raw ? JSON.parse(raw) : null;
  currentUser: User = {
    userId: 1,
    userName: 'admin',
    passwordHash: '',
    fullName: '管理員',
    email: '',
    phone: '',
    unitNumber: '',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: ''
  };

  // 搜尋篩選
  searchKeyword: string = '';
  selectedStatus: string = '';
  selectedUnit: string = '';   // 給 ADMIN/GUARD 篩選用

  // 分頁
  currentPage: number = 1;
  pageSize: number = 5;

  // Modal
  showDetailModal: boolean = false;
  showAddModal: boolean = false;
  showPickupModal: boolean = false;

  selectedPackage: any | null = null;
  pickupTarget: any | null = null;

  // 新增表單（先用 Partial，避免要填完整 User）
  newPackageForm: {
    recipientName: string;
    unitNumber: string;
    trackingNumber: string;
    courier: string;
    notes: string;
  } = { recipientName: '', unitNumber: '', trackingNumber: '', courier: '', notes: '' };

  // 暴露給 template 使用，讓 HTML 可以直接寫 PackageStatus.WAITING
  PackageStatus = PackageStatus;

  couriers = ['順豐速運', '黑貓宅急便', '萊爾富包裹', '中華郵政', '宅配通', 'DHL', '統一速達', '京東物流', '其他'];

  packages: any[] = [];

  constructor(private apiService: ApiService, private packageService: PackageService) { }

  ngOnInit(): void {
    this.loadPackages();
  }

  private loadPackages(): void {
    // 先呼叫 API 抓資料
    this.packageService.getAll().subscribe();

    // 訂閱資料流
    this.packageService.packages$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.packages = data;
    });
  }

  ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
    }
    private destroy$ = new Subject<void>();

  // ── 輔助：建立假 User（假資料專用）──────────────────
  private makeDummyUser(id: number, fullName: string, unitNumber: string): User {
    return {
      userId: id, userName: fullName, passwordHash: '',
      fullName, email: '', phone: '', unitNumber,
      role: UserRole.RESIDENT, isActive: true, createdAt: ''
    };
  }

  // ── 權限 ──────────────────────────────────────────────
  get isAdmin(): boolean { return this.currentUser.role === UserRole.ADMIN; }
  get isGuard(): boolean { return this.currentUser.role === UserRole.GUARD; }
  get isResident(): boolean { return this.currentUser.role === UserRole.RESIDENT; }

  // ── 是否已取貨（pickupAt 有值且 status 為 PICKED_UP）──
  isPickedUp(pkg: any): boolean {
    return pkg.status === PackageStatus.PICKED_UP;
  }

  // ── 篩選 ──────────────────────────────────────────────
  get filteredPackages(): any[] {
    let list = [...this.packages];

    // 住戶只看自己（user.unitNumber 對應登入者的 unitNumber）
    if (this.isResident) {
      list = list.filter(p => p.unitNumber === this.currentUser.unitNumber);
    }

    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.trim().toLowerCase();
      list = list.filter(p =>
        p.fullName.toLowerCase().includes(kw) ||       // 收件人姓名
        p.unitNumber.toLowerCase().includes(kw) ||    // 房號
        p.trackingNumber.toLowerCase().includes(kw) ||     // 追蹤號碼
        p.courier.toLowerCase().includes(kw)               // 快遞業者
      );
    }

    if (this.selectedStatus) {
      list = list.filter(p => p.status === this.selectedStatus);
    }

    if (this.selectedUnit) {
      list = list.filter(p => p.unitNumber === this.selectedUnit);
    }

    // 待取貨優先，再依到達時間降序
    list.sort((a, b) => {
      if (a.status === PackageStatus.WAITING && b.status !== PackageStatus.WAITING) return -1;
      if (a.status !== PackageStatus.WAITING && b.status === PackageStatus.WAITING) return 1;
      return new Date(b.arrivedAt).getTime() - new Date(a.arrivedAt).getTime();
    });

    return list;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPackages.length / this.pageSize);
  }

  get pagedPackages(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPackages.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ── 統計 ──────────────────────────────────────────────
  get waitingCount(): number {
    return this.packages.filter(p => p.status === PackageStatus.WAITING).length;
  }
  get pickedUpCount(): number {
    return this.packages.filter(p => p.status === PackageStatus.PICKED_UP).length;
  }
  get notNotifiedCount(): number {
    return this.packages.filter(p => p.status === PackageStatus.WAITING && !p.isNotified).length;
  }
  get todayCount(): number {
    const today = new Date().toDateString();
    return this.packages.filter(p => new Date(p.arrivedAt).toDateString() === today).length;
  }

  // ── 唯一房號（ADMIN/GUARD 篩選用）───────────────────
  get uniqueUnits(): string[] {
    return [...new Set(this.packages.map(p => p.unitNumber))].sort();
  }

  // ── 等待天數 ──────────────────────────────────────────
  waitingDays(arrivedAt: string): number {
    return Math.floor((Date.now() - new Date(arrivedAt).getTime()) / (1000 * 60 * 60 * 24));
  }

  // ── 格式化 ────────────────────────────────────────────
  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
      + ' ' + d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateFull(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
      + ' ' + d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  }

  // ── 詳情 ──────────────────────────────────────────────
  openDetail(pkg: any): void {
    this.selectedPackage = pkg;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedPackage = null;
  }

  // ── 新增包裹 ──────────────────────────────────────────
  openAdd(): void {
    this.newPackageForm = { recipientName: '', unitNumber: '', trackingNumber: '', courier: '', notes: '' };
    this.showAddModal = true;
  }

  closeAdd(): void { this.showAddModal = false; }

  submitAdd(): void {
    const f = this.newPackageForm;
    if (!f.recipientName.trim() || !f.unitNumber.trim() || !f.trackingNumber.trim()) return;

    const newPkg = {
      user: f.recipientName,
      unitNumber: f.unitNumber,
      trackingNumber: f.trackingNumber,
      courier: f.courier || '其他',
      arrivedAt: new Date().toISOString(),
      notes: f.notes
    };
    this.packageService.post(newPkg)
        .subscribe(
          res =>
          console.log(res)
        );
    this.closeAdd();
  }

  // ── 取貨確認 ──────────────────────────────────────────
  openPickup(pkg: any, event: Event): void {
    event.stopPropagation();
    this.pickupTarget = pkg;
    this.showPickupModal = true;
  }

  closePickup(): void {
    this.showPickupModal = false;
    this.pickupTarget = null;
  }

  confirmPickup(id: number): void {
    if (!this.pickupTarget) return;
    this.packageService.pickupById(id, new Date().toISOString())
    this.closePickup();
  }

  notifyResident(pkg: any, event: Event): void {
    event.stopPropagation();
    this.packageService.notifyById(pkg.id)
  }

  // ── 分頁 ──────────────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  onFilterChange(): void { this.currentPage = 1; }
}
