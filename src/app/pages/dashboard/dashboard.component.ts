import { PackageService } from './../../@service/package.service';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../@service/api.service';
import { AnnouncementService } from '../../@service/announcement.service';
import { StatisticsService } from '../../@service/statistics.service';
import { PackageStatus } from '../../interface/enum';
import { Announcement } from '../../interface/interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  // ===== 統計卡片資料 =====
  stats = [
    { label: '總住戶人數', value: '載入中...', icon: 'people',      color: '#3f51b5', bg: '#e8eaf6' },
    { label: '今日訪客',   value: '載入中...',  icon: 'person_add',  color: '#0288d1', bg: '#e1f5fe' },
    { label: '待處理報修', value: '載入中...',   icon: 'build',       color: '#f57c00', bg: '#fff3e0' },
    { label: '未取包裹',   value: '載入中...',  icon: 'inventory_2', color: '#388e3c', bg: '#e8f5e9' },
  ];

  announcements: Announcement[] = [];

  // ===== 最近訪客資料 =====
  recentVisitors: any[] = [];

  constructor(
    private apiService: ApiService,
    private announcementService: AnnouncementService,
    private statisticsService: StatisticsService,
    private packageService: PackageService
  ) {}

  ngOnInit(): void {
    // 取得訪客資料並更新統計與最近訪客列表
    this.apiService.getApi('/visitor/getVisitor').subscribe({
      next: (res: any) => {
        const visitors = Array.isArray(res) ? res : res?.data ?? [];

        // 1. 更新今日訪客統計
        const todayCount = visitors.filter((v: any) => this.isToday(v?.checkInTime)).length;
        this.stats[1].value = todayCount.toString();

        // 2. 處理最近 3 筆訪客
        this.recentVisitors = visitors
          .filter((v: any) => v.checkInTime) // 確保有進入時間
          .sort((a: any, b: any) => new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime())
          .slice(0, 3)
          .map((v: any) => ({
            name: v.visitorName || '未知',
            unit: v.residentialAddress || '未註記',
            time: this.formatTime(v.checkInTime),
            status: v.status === 'INSIDE' ? '在內' : '已離'
          }));
      },
      error: (error) => {
        console.error('取得訪客資料失敗:', error);
        this.stats[1].value = 'N/A';
        this.recentVisitors = [];
      }
    });

    this.announcementService.getAll().subscribe();
    this.announcementService.announs$.subscribe(data => {
      this.announcements = data
        .slice() // 先複製，避免改動原陣列
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 3);
    });

    this.packageService.getAll().subscribe();
    this.packageService.packages$.subscribe(data => {
      this.stats[3].value = data.filter(
        item => item.status === PackageStatus.WAITING
      ).length.toString();
    });

    this.statisticsService.getUserNum().subscribe(
      (res: number) => {
        this.stats[0].value = res.toString();
      },
      (error) => {
        console.error('取得使用者數量失敗', error);
        this.stats[0].value = 'N/A'; // API 失敗時顯示 N/A
      }
    );

    // 取得維修清單並更新「待處理報修」統計
    this.apiService.getApi('/repair').subscribe({
      next: (res: any) => {
        const repairs = Array.isArray(res) ? res : res?.data ?? [];
        // 計算狀態不是 COMPLETE 的維修件數
        const pendingCount = repairs.filter((r: any) => r.status !== 'COMPLETE').length;
        this.stats[2].value = pendingCount.toString();
      },
      error: (error) => {
        console.error('取得維修資料失敗:', error);
        this.stats[2].value = 'N/A';
      }
    });
  }

  private isToday(value?: string): boolean {
    if (!value) {
      return false;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();

    return date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
  }

  private formatTime(value?: string): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    // 格式化為 HH:mm
    return date.getHours().toString().padStart(2, '0') + ':' +
           date.getMinutes().toString().padStart(2, '0');
  }
}
