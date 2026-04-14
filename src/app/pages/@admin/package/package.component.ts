import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../@service/auth.service';
import { PackageService } from '../../../@service/package.service';
import { PackageStatus, UserRole } from '../../../interface/enum';
import { User } from '../../../interface/interface';
import { HttpService } from '../../../@service/http.service';

@Component({
  selector: 'app-package',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.scss']
})
export class PackageComponent implements OnInit, OnDestroy {
  // 目前登入者資訊會影響可見資料與可操作權限。
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

  searchKeyword = '';
  selectedStatus = '';
  selectedUnit = '';

  // 包裹列表採前端分頁，避免單頁資料過多。
  currentPage = 1;
  pageSize = 5;

  // 控制詳細、新增與領取確認視窗的開關狀態。
  showDetailModal = false;
  showAddModal = false;
  showPickupModal = false;

  selectedPackage: any | null = null;
  pickupTarget: any | null = null;

  newPackageForm = {
    recipientName: '',
    phoneNumber: '',
    unitNumber: '',
    trackingNumber: '',
    courier: '',
    notes: ''
  };

  PackageStatus = PackageStatus;

  couriers = ['黑貓宅急便', '新竹物流', '郵局', '宅配通', '順豐速運', 'DHL', 'Lalamove', 'FedEx', '其他'];

  addressList: string[] = [];
  packages: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpService,
    private authService: AuthService,
    private packageService: PackageService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadAddresses();
    this.loadPackages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    // 從登入資訊還原目前使用者，供角色與戶別篩選使用。
    const payload = this.authService.getUser();
    if (!payload) {
      return;
    }

    this.currentUser = {
      userId: payload.userId || 0,
      userName: payload.userName || payload.sub || 'user',
      passwordHash: '',
      fullName: payload.fullName || payload.name || '使用者',
      email: payload.email || '',
      phone: payload.phone || '',
      unitNumber: payload.unitNumber || '',
      role: this.mapRole(payload.role),
      isActive: true,
      createdAt: payload.createdAt || ''
    };
  }

  private mapRole(role: string | undefined): UserRole {
    switch (role) {
      case 'ADMIN':
        return UserRole.ADMIN;
      case 'GUARD':
        return UserRole.GUARD;
      default:
        return UserRole.RESIDENT;
    }
  }

  private loadPackages(): void {
    // 先向後端取資料，再透過 service 串流同步畫面。
    this.packageService.getAll().subscribe();

    this.packageService.packages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.packages = data.map(pkg => this.normalizePackage(pkg));

        // 若彈窗已開啟，保持彈窗中的資料與最新列表同步。
        if (this.selectedPackage) {
          const synced = this.packages.find(pkg => pkg.id === this.selectedPackage.id);
          if (synced) {
            this.selectedPackage = synced;
          }
        }

        if (this.pickupTarget) {
          const synced = this.packages.find(pkg => pkg.id === this.pickupTarget.id);
          if (synced) {
            this.pickupTarget = synced;
          }
        }
      });
  }

  private loadAddresses(): void {
    this.http.getApi('/visitor/allAddresses').subscribe((res: any) => {
      this.addressList = Array.isArray(res) ? res.sort() : [];
    });
  }

  private normalizePackage(pkg: any): any {
    // 統一整理後端欄位名稱，避免不同來源格式不一致。
    const userRef = pkg.user;
    const userName =
      typeof userRef === 'string'
        ? userRef
        : userRef?.fullName || pkg.recipientName || pkg.userName || pkg.fullName || '';

    const rawStatus = pkg.status || PackageStatus.WAITING;
    const status = rawStatus === 'PICKED' ? PackageStatus.PICKED_UP : rawStatus;

    return {
      ...pkg,
      id: pkg.id ?? pkg.packageId,
      user: userName,
      unitNumber: pkg.unitNumber || userRef?.unitNumber || '',
      trackingNumber: pkg.trackingNumber || pkg.trackingNo || '',
      courier: pkg.courier || pkg.deliveryCompany || '其他',
      arrivedAt: pkg.arrivedAt || pkg.createdAt || '',
      pickupAt: pkg.pickupAt || pkg.pickedUpAt || '',
      notes: pkg.notes || pkg.note || '',
      status
    };
  }

  get isAdmin(): boolean {
    return this.currentUser.role === UserRole.ADMIN;
  }

  get isGuard(): boolean {
    return this.currentUser.role === UserRole.GUARD;
  }

  get filteredPackages(): any[] {
    // 集中處理搜尋、篩選與排序，讓畫面資料來源一致。
    let list = [...this.packages];

    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.trim().toLowerCase();
      list = list.filter(pkg =>
        (pkg.user || '').toLowerCase().includes(keyword) ||
        (pkg.unitNumber || '').toLowerCase().includes(keyword) ||
        (pkg.trackingNumber || '').toLowerCase().includes(keyword) ||
        (pkg.courier || '').toLowerCase().includes(keyword)
      );
    }

    if (this.selectedStatus) {
      list = list.filter(pkg => pkg.status === this.selectedStatus);
    }

    if (this.selectedUnit) {
      list = list.filter(pkg => pkg.unitNumber === this.selectedUnit);
    }

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
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get waitingCount(): number {
    return this.packages.filter(pkg => pkg.status === PackageStatus.WAITING).length;
  }

  get pickedUpCount(): number {
    return this.packages.filter(pkg => pkg.status === PackageStatus.PICKED_UP).length;
  }

  get todayCount(): number {
    const today = new Date().toDateString();
    return this.packages.filter(pkg => new Date(pkg.arrivedAt).toDateString() === today).length;
  }

  get uniqueUnits(): string[] {
    return [...new Set(this.packages.map(pkg => pkg.unitNumber).filter(Boolean))].sort();
  }

  waitingDays(arrivedAt: string): number {
    return Math.floor((Date.now() - new Date(arrivedAt).getTime()) / (1000 * 60 * 60 * 24));
  }

  formatDate(dateStr: string): string {
    if (!dateStr) {
      return '--';
    }

    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' })
      + ' '
      + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateFull(dateStr: string): string {
    if (!dateStr) {
      return '--';
    }

    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
      + ' '
      + date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  }

  openDetail(pkg: any): void {
    this.selectedPackage = pkg;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedPackage = null;
  }

  openAdd(): void {
    this.newPackageForm = {
      recipientName: '',
      phoneNumber: '',
      unitNumber: '',
      trackingNumber: '',
      courier: '',
      notes: ''
    };
    this.showAddModal = true;
  }

  closeAdd(): void {
    this.showAddModal = false;
  }

  submitAdd(): void {
    // 送出前先檢查必要欄位，避免建立空白包裹資料。
    const form = this.newPackageForm;
    if (
      !form.recipientName.trim() ||
      !form.phoneNumber.trim() ||
      !form.unitNumber.trim() ||
      !form.trackingNumber.trim()
    ) {
      return;
    }

    this.packageService.post({
      recipientName: form.recipientName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      unitNumber: form.unitNumber.trim(),
      trackingNumber: form.trackingNumber.trim(),
      courier: form.courier || '其他',
      arrivedAt: new Date().toISOString(),
      notes: form.notes.trim()
    }).subscribe({
      next: () => {
        this.snackBar.open('包裹新增成功', '關閉', { duration: 2500 });
        this.closeAdd();
      },
      error: (error) => {
        console.error('包裹新增失敗:', error);
        const message =
          error?.error?.message ||
          (error?.status ? `新增失敗（${error.status}）` : '新增失敗，請稍後再試');
        this.snackBar.open(message, '關閉', { duration: 4000 });
      }
    });
  }

  openPickup(pkg: any, event: Event): void {
    // 按鈕位在可點擊列內，先阻止冒泡避免同時開啟詳情。
    event.stopPropagation();
    this.pickupTarget = pkg;
    this.showPickupModal = true;
  }

  closePickup(): void {
    this.showPickupModal = false;
    this.pickupTarget = null;
  }

  confirmPickup(id: number): void {
    if (!this.pickupTarget) {
      return;
    }

    this.packageService.pickupById(id, new Date().toISOString());
    this.closePickup();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onFilterChange(): void {
    // 篩選條件改變後回到第一頁，避免停留在無資料頁碼。
    this.currentPage = 1;
  }
}
