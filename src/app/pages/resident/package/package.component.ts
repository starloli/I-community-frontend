import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Package } from '../../../interface/interface';
import { PackageStatus } from '../../../interface/enum';

@Component({
  selector: 'app-package',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSnackBarModule],
  templateUrl: './package.component.html',
  styleUrl: './package.component.scss'
})
export class PackageComponent implements OnInit {

  // ── 暴露給 template 使用 ────────────────────────────
  PackageStatus = PackageStatus;

  // ── 住戶包裹篩選 ──────────────────────────────────────
  selectedStatus: 'all' | 'waiting' | 'pickedup' = 'all';
  searchKeyword: string = '';

  // ── 分頁 ──────────────────────────────────────────────
  currentPage: number = 1;
  pageSize: number = 5;

  // ── 住戶包裹假資料 ────────────────────────────────────
  // TODO: GET /packages/my（帶 token，只回傳自己的包裹）
  packages: Package[] = [
    {
      id: 1,
      user: { userId: 1, userName: '', fullName: '林家宇', email: '', phone: '', unitNumber: 'A-1201', passwordHash: '', role: 'RESIDENT' as any, isActive: true, createdAt: '' },
      trackingNumber: 'SF1234567890',
      courier: '順豐速運',
      arrivedAt: '2026-03-20T09:30:00',
      pickupAt: '',
      status: PackageStatus.WAITING,
      notes: '一件，中型紙箱',
      isNotified: true
    },
    {
      id: 2,
      user: { userId: 1, userName: '', fullName: '林家宇', email: '', phone: '', unitNumber: 'A-1201', passwordHash: '', role: 'RESIDENT' as any, isActive: true, createdAt: '' },
      trackingNumber: 'EC9876543210TW',
      courier: '黑貓宅急便',
      arrivedAt: '2026-03-19T11:00:00',
      pickupAt: '',
      status: PackageStatus.WAITING,
      notes: '兩件，輕型包裹',
      isNotified: true
    },
    {
      id: 3,
      user: { userId: 1, userName: '', fullName: '林家宇', email: '', phone: '', unitNumber: 'A-1201', passwordHash: '', role: 'RESIDENT' as any, isActive: true, createdAt: '' },
      trackingNumber: 'LP7758421369',
      courier: '萊爾富包裹',
      arrivedAt: '2026-03-15T14:20:00',
      pickupAt: '2026-03-15T18:45:00',
      status: PackageStatus.PICKED_UP,
      notes: '一件，衣物類',
      isNotified: true
    },
    {
      id: 4,
      user: { userId: 1, userName: '', fullName: '林家宇', email: '', phone: '', unitNumber: 'A-1201', passwordHash: '', role: 'RESIDENT' as any, isActive: true, createdAt: '' },
      trackingNumber: 'PC2468013579',
      courier: '中華郵政',
      arrivedAt: '2026-03-10T10:00:00',
      pickupAt: '2026-03-10T16:30:00',
      status: PackageStatus.PICKED_UP,
      notes: '一件，書籍類',
      isNotified: true
    },
    {
      id: 5,
      user: { userId: 1, userName: '', fullName: '林家宇', email: '', phone: '', unitNumber: 'A-1201', passwordHash: '', role: 'RESIDENT' as any, isActive: true, createdAt: '' },
      trackingNumber: 'YT1357924680',
      courier: '宅配通',
      arrivedAt: '2026-03-05T08:15:00',
      pickupAt: '2026-03-05T14:00:00',
      status: PackageStatus.PICKED_UP,
      notes: '一件，3C 產品，易碎請小心',
      isNotified: false
    },
    {
      id: 6,
      user: { userId: 1, userName: '', fullName: '林家宇', email: '', phone: '', unitNumber: 'A-1201', passwordHash: '', role: 'RESIDENT' as any, isActive: true, createdAt: '' },
      trackingNumber: 'DHL987654321',
      courier: 'DHL',
      arrivedAt: '2026-02-28T13:45:00',
      pickupAt: '2026-02-28T17:00:00',
      status: PackageStatus.PICKED_UP,
      notes: '一件，國際包裹',
      isNotified: true
    },
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    // TODO: 串接 API
    // this.apiService.getApi('/packages/my')
    //   .subscribe((res: any) => { this.packages = res.data; });
  }

  // ════════════════════════════════════════════════════
  // 住戶包裹篩選
  // ════════════════════════════════════════════════════
  get filteredPackages(): Package[] {
    let list = [...this.packages];

    if (this.selectedStatus === 'waiting') {
      list = list.filter(p => p.status === PackageStatus.WAITING);
    } else if (this.selectedStatus === 'pickedup') {
      list = list.filter(p => p.status === PackageStatus.PICKED_UP);
    }

    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.trim().toLowerCase();
      list = list.filter(p =>
        p.trackingNumber.toLowerCase().includes(kw) ||
        p.courier.toLowerCase().includes(kw) ||
        p.notes.toLowerCase().includes(kw)
      );
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

  get pagedPackages(): Package[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredPackages.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ════════════════════════════════════════════════════
  // 統計
  // ════════════════════════════════════════════════════
  get waitingCount(): number {
    return this.packages.filter(p => p.status === PackageStatus.WAITING).length;
  }

  get pickedUpCount(): number {
    return this.packages.filter(p => p.status === PackageStatus.PICKED_UP).length;
  }

  get totalCount(): number {
    return this.packages.length;
  }

  // ════════════════════════════════════════════════════
  // 操作
  // ════════════════════════════════════════════════════
  pickupPackage(pkg: Package): void {
    // TODO: POST /packages/{id}/pickup
    pkg.status = PackageStatus.PICKED_UP;
    pkg.pickupAt = new Date().toISOString();
    this.snackBar.open('✓ 已取貨', '', {
      duration: 2500,
      panelClass: ['snackbar-success']
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ════════════════════════════════════════════════════
  // 共用工具
  // ════════════════════════════════════════════════════
  formatDate(dateStr: string): string {
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
