import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { PackageService } from '../../../@service/package.service';
import { PackageStatus } from '../../../interface/enum';
import { ToastService } from '../../../@service/toast.service';

@Component({
  selector: 'app-package',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './package.component.html',
  styleUrl: './package.component.scss'
})
export class PackageComponent implements OnInit, OnDestroy {
  PackageStatus = PackageStatus;

  selectedStatus: 'all' | 'waiting' | 'pickedup' = 'all';
  searchKeyword = '';

  currentPage = 1;
  pageSize = 5;

  packages: any[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private toast: ToastService,
    private packageService: PackageService
  ) {}

  ngOnInit(): void {
    this.packageService.getUserAll().subscribe();

    this.packageService.userPackages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.packages = data.map(pkg => this.normalizePackage(pkg));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private normalizePackage(pkg: any): any {
    const userRef = pkg.user;
    const rawStatus = pkg.status || PackageStatus.WAITING;
    const status = rawStatus === 'PICKED' ? PackageStatus.PICKED_UP : rawStatus;

    return {
      ...pkg,
      id: pkg.id ?? pkg.packageId,
      userName:
        typeof userRef === 'string'
          ? userRef
          : userRef?.fullName || pkg.recipientName || pkg.userName || '',
      trackingNumber: pkg.trackingNumber || pkg.trackingNo || '',
      courier: pkg.courier || pkg.deliveryCompany || '其他',
      arrivedAt: pkg.arrivedAt || pkg.createdAt || '',
      pickupAt: pkg.pickupAt || pkg.pickedUpAt || '',
      notes: pkg.notes || pkg.note || '',
      status,
      isNotified: Boolean(pkg.isNotified ?? pkg.notified ?? pkg.notificationSent)
    };
  }

  get filteredPackages(): any[] {
    let list = [...this.packages];

    if (this.selectedStatus === 'waiting') {
      list = list.filter(pkg => pkg.status === PackageStatus.WAITING);
    } else if (this.selectedStatus === 'pickedup') {
      list = list.filter(pkg => pkg.status === PackageStatus.PICKED_UP);
    }

    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.trim().toLowerCase();
      list = list.filter(pkg =>
        (pkg.trackingNumber || '').toLowerCase().includes(keyword) ||
        (pkg.courier || '').toLowerCase().includes(keyword) ||
        (pkg.notes || '').toLowerCase().includes(keyword)
      );
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

  get totalCount(): number {
    return this.packages.length;
  }

  pickupPackage(pkg: any): void {
    const pickupAt = new Date().toISOString();
    this.packageService.pickupById(pkg.id, pickupAt).subscribe({
      next: () => {
        pkg.status = PackageStatus.PICKED_UP;
        pkg.pickupAt = pickupAt;
        this.toast.success('包裹已標記為已領取', 2500);
      },
      error: (error) => {
        console.error('包裹領取更新失敗:', error);
        const message =
          error?.error?.message ||
          (error?.status ? `包裹領取更新失敗（${error.status}）` : '包裹領取更新失敗，請稍後再試');
        this.toast.error(message, 4000);
      }
    });
  }

  setStatusFilter(status: 'all' | 'waiting' | 'pickedup'): void {
    this.selectedStatus = status;
    this.onFilterChange();
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) {
      return '--';
    }

    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  waitingDays(arrivedAt: string): number {
    const now = new Date();
    const arrived = new Date(arrivedAt);
    const diff = now.getTime() - arrived.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
