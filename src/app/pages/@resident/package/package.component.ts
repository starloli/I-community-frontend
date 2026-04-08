import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { PackageService } from '../../../@service/package.service';
import { PackageStatus } from '../../../interface/enum';

@Component({
  selector: 'app-package',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
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
    private snackBar: MatSnackBar,
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
      list = list.filter(p => p.status === PackageStatus.WAITING);
    } else if (this.selectedStatus === 'pickedup') {
      list = list.filter(p => p.status === PackageStatus.PICKED_UP);
    }

    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.trim().toLowerCase();
      list = list.filter(p =>
        (p.trackingNumber || '').toLowerCase().includes(kw) ||
        (p.courier || '').toLowerCase().includes(kw) ||
        (p.notes || '').toLowerCase().includes(kw)
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
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get waitingCount(): number {
    return this.packages.filter(p => p.status === PackageStatus.WAITING).length;
  }

  get pickedUpCount(): number {
    return this.packages.filter(p => p.status === PackageStatus.PICKED_UP).length;
  }

  get totalCount(): number {
    return this.packages.length;
  }

  pickupPackage(pkg: any): void {
    pkg.status = PackageStatus.PICKED_UP;
    pkg.pickupAt = new Date().toISOString();
    this.packageService.pickupById(pkg.id, new Date().toISOString());
    this.snackBar.open('✓ 已取貨', '', {
      duration: 2500,
      panelClass: ['snackbar-success']
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
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  waitingDays(arrivedAt: string): number {
    const now = new Date();
    const arrived = new Date(arrivedAt);
    const diff = now.getTime() - arrived.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
