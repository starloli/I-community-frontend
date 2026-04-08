import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { AuthService } from '../../../@service/auth.service';
import { PackageService } from '../../../@service/package.service';
import { PackageStatus, UserRole } from '../../../interface/enum';
import { User } from '../../../interface/interface';

@Component({
  selector: 'app-package',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './package.component.html',
  styleUrls: ['./package.component.scss']
})
export class PackageComponent implements OnInit, OnDestroy {
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

  currentPage = 1;
  pageSize = 5;

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

  couriers = ['順豐速運', '黑貓宅急便', '萊爾富包裹', '中華郵政', '宅配通', 'DHL', '統一速達', '京東物流', '其他'];

  packages: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private packageService: PackageService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadPackages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser(): void {
    const payload = this.authService.getUser();
    if (!payload) return;

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
    this.packageService.getAll().subscribe();

    this.packageService.packages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.packages = data.map(pkg => this.normalizePackage(pkg));

        if (this.selectedPackage) {
          const synced = this.packages.find(pkg => pkg.id === this.selectedPackage.id);
          if (synced) this.selectedPackage = synced;
        }

        if (this.pickupTarget) {
          const synced = this.packages.find(pkg => pkg.id === this.pickupTarget.id);
          if (synced) this.pickupTarget = synced;
        }
      });
  }

  private normalizePackage(pkg: any): any {
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
      status,
      isNotified: Boolean(pkg.isNotified ?? pkg.notified ?? pkg.notificationSent)
    };
  }

  get isAdmin(): boolean { return this.currentUser.role === UserRole.ADMIN; }
  get isGuard(): boolean { return this.currentUser.role === UserRole.GUARD; }
  get isResident(): boolean { return this.currentUser.role === UserRole.RESIDENT; }

  isPickedUp(pkg: any): boolean {
    return pkg.status === PackageStatus.PICKED_UP;
  }

  get filteredPackages(): any[] {
    let list = [...this.packages];

    if (this.isResident) {
      list = list.filter(p => p.unitNumber === this.currentUser.unitNumber);
    }

    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.trim().toLowerCase();
      list = list.filter(p =>
        (p.user || '').toLowerCase().includes(kw) ||
        (p.unitNumber || '').toLowerCase().includes(kw) ||
        (p.trackingNumber || '').toLowerCase().includes(kw) ||
        (p.courier || '').toLowerCase().includes(kw)
      );
    }

    if (this.selectedStatus) {
      list = list.filter(p => p.status === this.selectedStatus);
    }

    if (this.selectedUnit) {
      list = list.filter(p => p.unitNumber === this.selectedUnit);
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
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

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

  get uniqueUnits(): string[] {
    return [...new Set(this.packages.map(p => p.unitNumber).filter(Boolean))].sort();
  }

  waitingDays(arrivedAt: string): number {
    return Math.floor((Date.now() - new Date(arrivedAt).getTime()) / (1000 * 60 * 60 * 24));
  }

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

  openDetail(pkg: any): void {
    this.selectedPackage = pkg;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedPackage = null;
  }

  openAdd(): void {
    this.newPackageForm = { recipientName: '', phoneNumber: '', unitNumber: '', trackingNumber: '', courier: '', notes: '' };
    this.showAddModal = true;
  }

  closeAdd(): void {
    this.showAddModal = false;
  }

  submitAdd(): void {
    const f = this.newPackageForm;
    if (!f.recipientName.trim() || !f.phoneNumber.trim() || !f.unitNumber.trim() || !f.trackingNumber.trim()) return;

    this.packageService.post({
      recipientName: f.recipientName,
      phoneNumber: f.phoneNumber.trim(),
      unitNumber: f.unitNumber,
      trackingNumber: f.trackingNumber,
      courier: f.courier || '其他',
      arrivedAt: new Date().toISOString(),
      notes: f.notes
    }).subscribe({
      next: () => {
        this.snackBar.open('包裹登記成功', '關閉', { duration: 2500 });
        this.closeAdd();
      },
      error: (error) => {
        console.error('包裹登記失敗:', error);
        const message =
          error?.error?.message ||
          (error?.status ? `登記失敗（${error.status}）` : '登記失敗，請檢查 API 路徑與欄位');
        this.snackBar.open(message, '關閉', { duration: 4000 });
      }
    });
  }

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
    this.packageService.pickupById(id, new Date().toISOString());
    this.closePickup();
  }

  notifyResident(pkg: any, event: Event): void {
    event.stopPropagation();
    this.packageService.notifyById(pkg.id);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }
}
