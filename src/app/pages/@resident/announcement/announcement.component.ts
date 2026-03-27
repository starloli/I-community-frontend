import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AnnouncementService } from '../../../@service/announcement.service';

interface Announcement {
  announcementId: number;
  title: string;
  content: string;
  category: string;
  authorName: string;
  isPinned: boolean;
  publishedAt: string;
  expiresAt?: string;
}

@Component({
  selector: 'app-resident-announcement',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss']
})
export class ResidentAnnouncementComponent implements OnInit {

  // ── 搜尋與篩選 ────────────────────────────────────────
  searchKeyword: string = '';
  selectedCategory: string = '';

  // ── 分頁 ──────────────────────────────────────────────
  currentPage: number = 1;
  pageSize: number = 8;

  // ── 詳情 Modal ────────────────────────────────────────
  showDetailModal: boolean = false;
  selectedAnnouncement: Announcement | null = null;

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

  constructor(private service: AnnouncementService) {}

  ngOnInit(): void {
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

    // 置頂優先，再依發布時間降序，過期的不顯示
    list = list.filter(a => !this.isExpired(a));
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

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }

  formatDatetime(dateStr?: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
      + ' ' + d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  }

  // ── 詳情 Modal ────────────────────────────────────────
  openDetail(ann: Announcement): void {
    this.selectedAnnouncement = ann;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedAnnouncement = null;
  }

  // ── 分頁 ──────────────────────────────────────────────
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }
}
