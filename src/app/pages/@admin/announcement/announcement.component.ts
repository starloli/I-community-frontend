import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../@service/auth.service';
import { AnnouncementService } from '../../../@service/announcement.service';

import { Announcement, AnnouncementPayload, User } from '../../../interface/interface';
import { UserRole } from '../../../interface/enum';

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

  isAdmin: boolean = false;

  // 搜尋與篩選
  searchKeyword: string = '';
  selectedCategory: string = '';

  // ── 分頁 ──────────────────────────────────────────────
  currentPage: number = 1;
  pageSize: number = 6;
  minDateTime: string = '';

  // ── Modal 狀態 ────────────────────────────────────────
  showFormModal: boolean = false;
  showDetailModal: boolean = false;
  showDeleteConfirm: boolean = false;
  isEditMode: boolean = false;

  selectedAnnouncement: Announcement | null = null;
  deleteTargetId: number | null = null;
  formData: Partial<Announcement> = {};

  // ── 分類選項 ──────────────────────────────────────────
  categories = [
    { value: '',            label: '全部分類' },
    { value: 'NOTICE',      label: '一般通知' },
    { value: 'MAINTENANCE', label: '維修公告' },
    { value: 'EVENT',       label: '活動公告' },
    { value: 'EMERGENCY',   label: '緊急通知' },
    { value: 'RULE',        label: '社區規範' },
  ];

  announcements: Announcement[] = [];

  constructor(
    private auth: AuthService,
    private service: AnnouncementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    this.refreshMinDateTime();
    // ── 從後端取得公告列表 ────────────────────────────
    this.service.getAll().subscribe();
    this.service.announs$.subscribe((data: any[]) => {
      this.announcements = data;
    });
  }

  // ── 篩選邏輯 ──────────────────────────────────────────
  get filteredAnnouncements(): Announcement[] {
    let list = [...this.announcements];

    if (this.searchKeyword.trim()) {
      const kw = this.searchKeyword.trim().toLowerCase();
      list = list.filter(a =>
        a.title.toLowerCase().includes(kw) ||
        (a.content ?? '').toLowerCase().includes(kw)
      );
    }

    if (this.selectedCategory) {
      list = list.filter(a => a.category === this.selectedCategory);
    }

    // 置頂優先，再依發布時間降序
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const timeA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const timeB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return timeB - timeA;
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

  // ── 工具方法 ──────────────────────────────────────────
  isExpired(ann: Announcement): boolean {
    if (!ann.expiresAt) return false;
    return new Date(ann.expiresAt) < new Date();
  }

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

  getAuthorName(announcement: Announcement & { authorName?: string }): string {
    return announcement.authorName ?? '未知作者';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    const safeDateStr: string = dateStr;
    return new Date(safeDateStr).toLocaleDateString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }

  formatDatetime(dateStr?: string): string {
    if (!dateStr) return '—';
    const safeDateStr: string = dateStr;
    const d = new Date(safeDateStr);
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
      + ' ' + d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  }

  // ── 詳情 Modal ────────────────────────────────────────
  toDateTimeLocalValue(dateStr?: string | null): string {
    if (!dateStr) return '';

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  refreshMinDateTime(): void {
    this.minDateTime = this.toDateTimeLocalValue(new Date().toISOString());
  }

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
    this.refreshMinDateTime();
    this.isEditMode = false;
    const oneMonthLater = this.toDateTimeLocalValue(
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    );
    this.formData = { category: 'NOTICE', isPinned: false, expiresAt: oneMonthLater };
    this.showFormModal = true;
  }

  // ── 編輯 ──────────────────────────────────────────────
  openEdit(ann: Announcement, event: Event): void {
    event.stopPropagation();
    this.refreshMinDateTime();
    this.isEditMode = true;
    this.formData = {
      ...ann,
      expiresAt: this.toDateTimeLocalValue(ann.expiresAt)
    };
    this.showFormModal = true;
  }

  closeForm(): void {
    this.showFormModal = false;
    this.formData = {};
  }

  submitForm(): void {
    if (!this.formData.title?.trim() || !this.formData.content?.trim()) {
      this.snackBar.open('請先填寫公告標題與內容', '關閉', { duration: 2000 });
      return;
    }

    this.refreshMinDateTime();
    const expiresAtValue = this.formData.expiresAt;

    if (typeof expiresAtValue === 'string' && expiresAtValue && expiresAtValue < this.minDateTime) {
      this.snackBar.open('到期日期不可早於今天', '關閉', { duration: 2000 });
      return;
    }

    const payload: AnnouncementPayload = {
      title: this.formData.title.trim(),
      content: this.formData.content.trim(),
      category: this.formData.category ?? 'NOTICE',
      isPinned: this.formData.isPinned ?? false,
      expiresAt: typeof expiresAtValue === 'string' && expiresAtValue
        ? expiresAtValue
        : null
    };

    if (this.isEditMode) {
      // TODO: 串接 PUT /announcement/{announcementId}
      // this.service.update(this.formData.announcementId!, this.formData).subscribe(...)
      if (!this.formData.announcementId) {
        this.snackBar.open('找不到要更新的公告 ID', '關閉', { duration: 2000 });
        return;
      }

      this.service.updateById(this.formData.announcementId, payload).subscribe({
        next: () => {
          this.snackBar.open('公告更新成功', '關閉', { duration: 2000 });
          this.closeForm();
        },
        error: () => {
          this.snackBar.open('公告更新失敗，請稍後再試', '關閉', { duration: 2500 });
        }
      });
    } else {
      this.service.postAnnoun(payload).subscribe({
        next: () => {
          this.snackBar.open('公告發布成功', '關閉', { duration: 2000 });
          this.closeForm();
        },
        error: () => {
          this.snackBar.open('公告發布失敗，請稍後再試', '關閉', { duration: 2500 });
        }
      });
      // TODO: 串接 POST /announcement/create
    }
  }

  // ── 刪除 ──────────────────────────────────────────────
  openDelete(id: number | undefined, event: Event): void {
    event.stopPropagation();
    if (id === undefined) {
      this.snackBar.open('找不到要刪除的公告 ID', '關閉', { duration: 2000 });
      return;
    }
    this.deleteTargetId = id;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (this.deleteTargetId !== null && this.deleteTargetId !== undefined) {
      const idToDelete: number = this.deleteTargetId; // 確保是 number 類型
      // ── 串接後端刪除 API ──────────────────────────────
      this.service.deleteById(idToDelete).subscribe({
        next: () => {
          this.snackBar.open('公告已成功刪除', '關閉', { duration: 2000 });
          this.announcements = this.announcements.filter(
            a => a.announcementId !== idToDelete
          );
        },
        error: () => {
          this.snackBar.open('公告刪除失敗，請稍後再試', '關閉', { duration: 2500 });
        }
      });
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
