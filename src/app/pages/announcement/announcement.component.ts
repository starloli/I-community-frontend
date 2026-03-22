import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Announcement, Res, User } from '../../interface/interface';
import { UserRole } from '../../interface/enum';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-announcement',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss']
})
export class AnnouncementComponent implements OnInit {

  // TODO: 從 localStorage 取得當前使用者
  // const raw = localStorage.getItem('user');
  // this.currentUser = raw ? JSON.parse(raw) : null;
  currentUser: User = {
    userId: 1,
    userName: 'admin',
    passwordHash: '',
    fullName: '管理員',
    email: 'admin@community.com',
    phone: '',
    unitNumber: '',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: ''
  };

  // 搜尋與篩選
  searchKeyword: string = '';
  selectedCategory: string = '';

  // 分頁
  currentPage: number = 1;
  pageSize: number = 6;

  // Modal 狀態
  showFormModal: boolean = false;
  showDetailModal: boolean = false;
  showDeleteConfirm: boolean = false;
  isEditMode: boolean = false;

  selectedAnnouncement: Announcement | null = null;
  deleteTargetId: number | null = null;

  // 表單資料（Partial 讓欄位可以不用一次填滿）
  formData: Partial<Announcement> = {};

  // 分類選項
  categories = [
    { value: '',            label: '全部分類' },
    { value: 'NOTICE',      label: '一般通知' },
    { value: 'MAINTENANCE', label: '維修公告' },
    { value: 'EVENT',       label: '活動公告' },
    { value: 'EMERGENCY',   label: '緊急通知' },
    { value: 'RULE',        label: '社區規範' },
  ];

  // TODO: 之後改為 this.apiService.getApi('/announcement/list')
  announcements: Announcement[] = [
    {
      announcementId: 1,
      title: '🎉 端午節社區聯歡活動',
      content: '親愛的住戶您好，本社區將於六月初舉辦端午節聯歡晚會，歡迎攜家帶眷共同參與。活動內容包括包粽子競賽、表演節目、以及抽獎活動。報名請洽管理室。',
      category: 'EVENT',
      author: this.makeDummyUser(1, '管理員', UserRole.ADMIN),
      isPinned: true,
      publishedAt: '2025-05-20T10:00:00',
      expiresAt: '2025-06-10T23:59:59'
    },
    {
      announcementId: 2,
      title: '⚠️ 電梯定期保養停用通知',
      content: '敬告住戶：B棟電梯將於本週六上午 08:00～12:00 進行年度定期保養，期間停止使用。不便之處敬請見諒，如有緊急需求請洽管理室。',
      category: 'MAINTENANCE',
      author: this.makeDummyUser(2, '工程部', UserRole.ADMIN),
      isPinned: true,
      publishedAt: '2025-05-18T09:00:00',
      expiresAt: '2025-05-25T23:59:59'
    },
    {
      announcementId: 3,
      title: '📌 住戶停車位使用規範更新',
      content: '為維護社區停車秩序，即日起停車位禁止停放機車，訪客車輛請停至地下二樓訪客區，違規車輛將依規定開立罰單並通知車主移車。',
      category: 'RULE',
      author: this.makeDummyUser(1, '管理員', UserRole.ADMIN),
      isPinned: false,
      publishedAt: '2025-05-15T14:00:00',
      expiresAt: '2025-12-31T23:59:59'
    },
    {
      announcementId: 4,
      title: '🔧 公共水管修繕通知',
      content: '本社區地下室主水管將進行修繕工程，施工期間（5/22 上午 9:00 至下午 3:00）全棟暫停供水，請住戶事先儲水備用。感謝您的配合。',
      category: 'MAINTENANCE',
      author: this.makeDummyUser(2, '工程部', UserRole.ADMIN),
      isPinned: false,
      publishedAt: '2025-05-14T11:00:00',
      expiresAt: '2025-05-22T15:00:00'
    },
    {
      announcementId: 5,
      title: '🚨 社區防盜安全宣導',
      content: '近期鄰近社區發生多起宵小闖空門事件，請住戶外出務必確認門窗已上鎖，發現可疑人士請立即通報管理室或撥打110。本社區已加強夜間巡邏。',
      category: 'EMERGENCY',
      author: this.makeDummyUser(3, '警衛隊長', UserRole.GUARD),
      isPinned: false,
      publishedAt: '2025-05-12T08:30:00',
      expiresAt: '2025-06-12T23:59:59'
    },
    {
      announcementId: 6,
      title: '📋 年度住戶大會通知',
      content: '本年度住戶大會訂於六月十五日（星期日）下午兩點，假一樓集會所舉行，議程包括年度收支報告、修繕計劃審議、管委會改選等事項，請住戶踴躍出席。',
      category: 'NOTICE',
      author: this.makeDummyUser(1, '管理委員會', UserRole.ADMIN),
      isPinned: false,
      publishedAt: '2025-05-10T10:00:00',
      expiresAt: '2025-06-15T14:00:00'
    },
    {
      announcementId: 7,
      title: '🌿 社區綠化植栽更換',
      content: '本月底將針對社區中庭老舊植栽進行更換，新植栽選用本地低維護樹種，期間可能影響中庭出入，請住戶多加留意，感謝配合。',
      category: 'NOTICE',
      author: this.makeDummyUser(1, '管理員', UserRole.ADMIN),
      isPinned: false,
      publishedAt: '2025-05-05T10:00:00',
      expiresAt: '2025-05-31T23:59:59'
    },
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // TODO: 串接 API
    // this.apiService.getApi('/announcement/list').subscribe((res: Res) => {
    //   this.announcements = res.data;
    // });
  }

  // ── 輔助：建立假 User（假資料專用）──────────────────
  private makeDummyUser(id: number, fullName: string, role: UserRole): User {
    return {
      userId: id, userName: fullName, passwordHash: '',
      fullName, email: '', phone: '', unitNumber: '',
      role, isActive: true, createdAt: ''
    };
  }

  // ── 權限 ──────────────────────────────────────────────
  get isAdmin(): boolean {
    return this.currentUser.role === UserRole.ADMIN;
  }

  // ── 是否過期（expiresAt < 現在）─────────────────────
  isExpired(ann: Announcement): boolean {
    if (!ann.expiresAt) return false;
    return new Date(ann.expiresAt) < new Date();
  }

  // ── 篩選 ──────────────────────────────────────────────
  get filteredAnnouncements(): Announcement[] {
    let list = [...this.announcements];

    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.trim().toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(kw) ||
        a.content.toLowerCase().includes(kw)
      );
    }

    if (this.selectedCategory) {
      list = list.filter(a => a.category === this.selectedCategory);
    }

    // 置頂優先，再依發布時間降序
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

    return list;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAnnouncements.length / this.pageSize);
  }

  get pagedAnnouncements(): Announcement[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAnnouncements.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // ── 統計 ──────────────────────────────────────────────
  get pinnedCount(): number {
    return this.announcements.filter(a => a.isPinned && !this.isExpired(a)).length;
  }
  get activeCount(): number {
    return this.announcements.filter(a => !this.isExpired(a)).length;
  }
  get categoryCount(): number {
    return new Set(this.announcements.map(a => a.category)).size;
  }

  // ── 格式化工具 ────────────────────────────────────────
  getCategoryLabel(value: string): string {
    return this.categories.find(c => c.value === value)?.label ?? value;
  }

  getCategoryClass(category: string): string {
    const map: Record<string, string> = {
      NOTICE: 'cat-notice', MAINTENANCE: 'cat-maintenance',
      EVENT: 'cat-event', EMERGENCY: 'cat-emergency', RULE: 'cat-rule',
    };
    return map[category] ?? 'cat-notice';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }

  formatDatetime(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
      + ' ' + d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  }

  // ── 詳情 ──────────────────────────────────────────────
  openDetail(ann: Announcement): void {
    this.selectedAnnouncement = ann;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedAnnouncement = null;
  }

  // ── 新增 ──────────────────────────────────────────────
  openAdd(): void {
    this.isEditMode = false;
    // 預設到期時間：一個月後
    const oneMonthLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 16);
    this.formData = { category: 'NOTICE', isPinned: false, expiresAt: oneMonthLater };
    this.showFormModal = true;
  }

  // ── 編輯 ──────────────────────────────────────────────
  openEdit(ann: Announcement, event: Event): void {
    event.stopPropagation();
    this.isEditMode = true;
    this.formData = {
      ...ann,
      // datetime-local input 需要 YYYY-MM-DDTHH:mm 格式
      expiresAt: ann.expiresAt ? ann.expiresAt.slice(0, 16) : ''
    };
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
    this.formData = {};
  }

  submitForm(): void {
    if (!this.formData.title?.trim() || !this.formData.content?.trim()) return;

    if (this.isEditMode) {
      // TODO: PUT /announcement/{announcementId}
      // this.apiService.putApi(`/announcement/${this.formData.announcementId}`, this.formData)
      //   .subscribe((res: Res) => { /* 更新列表 */ });
      const idx = this.announcements.findIndex(
        a => a.announcementId === this.formData.announcementId
      );
      if (idx !== -1) {
        this.announcements[idx] = {
          ...this.announcements[idx],
          title:     this.formData.title!,
          content:   this.formData.content!,
          category:  this.formData.category ?? 'NOTICE',
          isPinned:  this.formData.isPinned ?? false,
          expiresAt: this.formData.expiresAt ?? ''
        };
      }
    } else {
      // TODO: POST /announcement/create
      // this.apiService.postApi('/announcement/create', payload)
      //   .subscribe((res: Res) => { this.announcements.unshift(res.data); });
      const newAnn: Announcement = {
        announcementId: Date.now(),
        title:       this.formData.title!,
        content:     this.formData.content!,
        category:    this.formData.category ?? 'NOTICE',
        author:      this.currentUser,
        isPinned:    this.formData.isPinned ?? false,
        publishedAt: new Date().toISOString(),
        expiresAt:   this.formData.expiresAt ?? ''
      };
      this.announcements.unshift(newAnn);
    }
    this.closeForm();
  }

  // ── 刪除 ──────────────────────────────────────────────
  openDelete(id: number, event: Event): void {
    event.stopPropagation();
    this.deleteTargetId = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (this.deleteTargetId !== null) {
      // TODO: DELETE /announcement/{announcementId}
      // this.apiService.delApi(`/announcement/${this.deleteTargetId}`)
      //   .subscribe(() => { ... });
      this.announcements = this.announcements.filter(
        a => a.announcementId !== this.deleteTargetId
      );
    }
    this.showDeleteConfirm = false;
    this.deleteTargetId = null;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTargetId = null;
  }

  // ── 分頁 ──────────────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }
}
