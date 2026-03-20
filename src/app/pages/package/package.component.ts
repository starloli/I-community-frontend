import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { Package, Res, User } from '../../interface/interface';
import { PackageStatus, UserRole } from '../../interface/enum';

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

  selectedPackage: Package | null = null;
  pickupTarget: Package | null = null;

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

  // TODO: 之後改為 this.apiService.getApi('/package/list')
  // Package.user 對應 User 物件（含 unitNumber, fullName 等）
  packages: Package[] = [
    {
      id: 1,
      user: this.makeDummyUser(10, '林家宇', 'A-1201'),
      trackingNumber: 'SF1234567890',
      courier: '順豐速運',
      arrivedAt: '2025-05-20T09:30:00',
      pickupAt: '',                       // ← 對應 interface.pickupAt（空字串 = 未取貨）
      status: PackageStatus.WAITING,
      notes: '一件，中型紙箱',
      isNotified: true                    // ← 對應 interface.isNotified
    },
    {
      id: 2,
      user: this.makeDummyUser(11, '王志明', 'A-0805'),
      trackingNumber: 'EC9876543210TW',
      courier: '黑貓宅急便',
      arrivedAt: '2025-05-20T11:00:00',
      pickupAt: '',
      status: PackageStatus.WAITING,
      notes: '兩件，輕型包裹',
      isNotified: true
    },
    {
      id: 3,
      user: this.makeDummyUser(12, '陳美玲', 'B-0302'),
      trackingNumber: 'LP7758421369',
      courier: '萊爾富包裹',
      arrivedAt: '2025-05-19T14:20:00',
      pickupAt: '2025-05-19T18:45:00',   // ← 有值 = 已取貨
      status: PackageStatus.PICKED_UP,
      notes: '一件，衣物類',
      isNotified: true
    },
    {
      id: 4,
      user: this.makeDummyUser(13, '李大偉', 'C-1501'),
      trackingNumber: 'PC2468013579',
      courier: '中華郵政',
      arrivedAt: '2025-05-18T10:00:00',
      pickupAt: '2025-05-18T16:30:00',
      status: PackageStatus.PICKED_UP,
      notes: '一件，書籍類',
      isNotified: true
    },
    {
      id: 5,
      user: this.makeDummyUser(14, '張小芳', 'B-0910'),
      trackingNumber: 'YT1357924680',
      courier: '宅配通',
      arrivedAt: '2025-05-21T08:15:00',
      pickupAt: '',
      status: PackageStatus.WAITING,
      notes: '一件，3C 產品，易碎請小心',
      isNotified: false
    },
    {
      id: 6,
      user: this.makeDummyUser(15, '黃建國', 'A-0401'),
      trackingNumber: 'DHL987654321',
      courier: 'DHL',
      arrivedAt: '2025-05-21T13:45:00',
      pickupAt: '',
      status: PackageStatus.WAITING,
      notes: '一件，國際包裹，需本人簽收',
      isNotified: true
    },
    {
      id: 7,
      user: this.makeDummyUser(16, '吳淑惠', 'C-0705'),
      trackingNumber: 'KE5544332211',
      courier: '統一速達',
      arrivedAt: '2025-05-17T10:30:00',
      pickupAt: '2025-05-17T12:00:00',
      status: PackageStatus.PICKED_UP,
      notes: '兩件，食品類',
      isNotified: true
    },
    {
      id: 8,
      user: this.makeDummyUser(10, '林家宇', 'A-1201'),
      trackingNumber: 'JD8800990011',
      courier: '京東物流',
      arrivedAt: '2025-05-21T15:00:00',
      pickupAt: '',
      status: PackageStatus.WAITING,
      notes: '一件，家電類，約 8 公斤',
      isNotified: false
    },
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // TODO: 串接 API
    // this.apiService.getApi('/package/list').subscribe((res: Res) => {
    //   this.packages = res.data;
    // });
  }

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
  isPickedUp(pkg: Package): boolean {
    return pkg.status === PackageStatus.PICKED_UP;
  }

  // ── 篩選 ──────────────────────────────────────────────
  get filteredPackages(): Package[] {
    let list = [...this.packages];

    // 住戶只看自己（user.unitNumber 對應登入者的 unitNumber）
    if (this.isResident) {
      list = list.filter(p => p.user.unitNumber === this.currentUser.unitNumber);
    }

    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.trim().toLowerCase();
      list = list.filter(p =>
        p.user.fullName.toLowerCase().includes(kw) ||       // 收件人姓名
        p.user.unitNumber.toLowerCase().includes(kw) ||    // 房號
        p.trackingNumber.toLowerCase().includes(kw) ||     // 追蹤號碼
        p.courier.toLowerCase().includes(kw)               // 快遞業者
      );
    }

    if (this.selectedStatus) {
      list = list.filter(p => p.status === this.selectedStatus);
    }

    if (this.selectedUnit) {
      list = list.filter(p => p.user.unitNumber === this.selectedUnit);
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
    return [...new Set(this.packages.map(p => p.user.unitNumber))].sort();
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
  openDetail(pkg: Package): void {
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

    // TODO: POST /package/create（後端會自動關聯 user）
    // const payload = { trackingNumber: f.trackingNumber, courier: f.courier, notes: f.notes, unitNumber: f.unitNumber };
    // this.apiService.postApi('/package/create', payload).subscribe((res: Res) => { ... });

    // 假資料：用表單資訊建構一筆 Package
    const newPkg: Package = {
      id: Date.now(),
      user: this.makeDummyUser(Date.now(), f.recipientName, f.unitNumber),
      trackingNumber: f.trackingNumber,
      courier: f.courier || '其他',
      arrivedAt: new Date().toISOString(),
      pickupAt: '',
      status: PackageStatus.WAITING,
      notes: f.notes,
      isNotified: false
    };
    this.packages.unshift(newPkg);
    this.closeAdd();
  }

  // ── 取貨確認 ──────────────────────────────────────────
  openPickup(pkg: Package, event: Event): void {
    event.stopPropagation();
    this.pickupTarget = pkg;
    this.showPickupModal = true;
  }

  closePickup(): void {
    this.showPickupModal = false;
    this.pickupTarget = null;
  }

  confirmPickup(): void {
    if (!this.pickupTarget) return;
    // TODO: PUT /package/{id}/pickup
    // this.apiService.putApi(`/package/${this.pickupTarget.id}/pickup`, {})
    //   .subscribe((res: Res) => { /* 更新列表 */ });
    const idx = this.packages.findIndex(p => p.id === this.pickupTarget!.id);
    if (idx !== -1) {
      this.packages[idx] = {
        ...this.packages[idx],
        status: PackageStatus.PICKED_UP,
        pickupAt: new Date().toISOString()   // ← 寫入 pickupAt
      };
    }
    this.closePickup();
  }

  // ── 通知住戶 ──────────────────────────────────────────
  notifyResident(pkg: Package, event: Event): void {
    event.stopPropagation();
    // TODO: POST /package/{id}/notify
    // this.apiService.postApi(`/package/${pkg.id}/notify`, {}).subscribe(...);
    const idx = this.packages.findIndex(p => p.id === pkg.id);
    if (idx !== -1) {
      this.packages[idx] = { ...this.packages[idx], isNotified: true };  // ← 更新 isNotified
    }
  }

  // ── 分頁 ──────────────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  onFilterChange(): void { this.currentPage = 1; }
}
