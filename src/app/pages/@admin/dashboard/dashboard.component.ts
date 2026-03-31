import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { AnnouncementService } from '../../../@service/announcement.service';
import { ApiService } from '../../../@service/api.service';
import { RepairService } from '../../../@service/repair.service';
import { StatisticsService } from '../../../@service/statistics.service';
import { PackageStatus, RepairStatus } from '../../../interface/enum';
import { Announcement } from '../../../interface/interface';
import { PackageService } from './../../../@service/package.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats = [
    { label: '社區住戶總數', value: '載入中...', icon: 'people', color: '#3f51b5', bg: '#e8eaf6' },
    { label: '今日訪客登記', value: '載入中...', icon: 'person_add', color: '#0288d1', bg: '#e1f5fe' },
    { label: '待處理報修', value: '載入中...', icon: 'build', color: '#f57c00', bg: '#fff3e0' },
    { label: '待領取包裹', value: '載入中...', icon: 'inventory_2', color: '#388e3c', bg: '#e8f5e9' },
  ];

  announcements: Announcement[] = [];
  recentVisitors: Array<{ name: string; unit: string; time: string; status: string }> = [];

  constructor(
    private apiService: ApiService,
    private announcementService: AnnouncementService,
    private statisticsService: StatisticsService,
    private packageService: PackageService,
    private repairService: RepairService
  ) {}

  ngOnInit(): void {
    this.loadVisitors();
    this.loadAnnouncements();
    this.loadPackages();
    this.loadUserCount();
    this.loadPendingRepairs();
  }

  private loadVisitors(): void {
    this.apiService.getApi('/visitor/getVisitor').subscribe({
      next: (res: any) => {
        const visitors = Array.isArray(res) ? res : res?.data ?? [];

        const todayCount = visitors.filter((visitor: any) => this.isToday(visitor?.checkInTime)).length;
        this.stats[1].value = todayCount.toString();

        this.recentVisitors = visitors
          .filter((visitor: any) => visitor.checkInTime)
          .sort((a: any, b: any) => this.getDateTimestamp(b?.checkInTime) - this.getDateTimestamp(a?.checkInTime))
          .slice(0, 3)
          .map((visitor: any) => ({
            name: visitor.visitorName || '未命名',
            unit: visitor.residentialAddress || '未註記',
            time: this.formatTime(visitor.checkInTime),
            status: visitor.status === 'INSIDE' ? '在社區' : '已離開'
          }));
      },
      error: (error) => {
        console.error('取得訪客資料失敗:', error);
        this.stats[1].value = 'N/A';
        this.recentVisitors = [];
      }
    });
  }

  private loadAnnouncements(): void {
    this.announcementService.getAll().subscribe();
    this.announcementService.announs$.subscribe(data => {
      this.announcements = data
        .slice()
        .sort((a, b) => this.getDateTimestamp(b?.publishedAt) - this.getDateTimestamp(a?.publishedAt))
        .slice(0, 3);
    });
  }

  private loadPackages(): void {
    this.packageService.getAll().subscribe();
    this.packageService.packages$.subscribe(data => {
      this.stats[3].value = data
        .filter(item => item.status === PackageStatus.WAITING)
        .length
        .toString();
    });
  }

  private loadUserCount(): void {
    this.statisticsService.getUserNum().subscribe(
      (res: number) => {
        this.stats[0].value = res.toString();
      },
      (error) => {
        console.error('取得住戶總數失敗:', error);
        this.stats[0].value = 'N/A';
      }
    );
  }

  private loadPendingRepairs(): void {
    // Use the same source as the admin repair page so the "待處理報修" count stays consistent.
    this.repairService.getAll().subscribe({
      error: (error) => {
        console.error('取得報修資料失敗:', error);
        this.stats[2].value = 'N/A';
      }
    });

    this.repairService.repairs$.subscribe(data => {
      this.stats[2].value = data
        .filter(item => item.status === RepairStatus.PENDING)
        .length
        .toString();
    });
  }

  private isToday(value?: string): boolean {
    const timestamp = this.getDateTimestamp(value);
    if (!timestamp) {
      return false;
    }

    const date = new Date(timestamp);
    const today = new Date();

    return date.getFullYear() === today.getFullYear()
      && date.getMonth() === today.getMonth()
      && date.getDate() === today.getDate();
  }

  private formatTime(value?: string): string {
    const timestamp = this.getDateTimestamp(value);
    if (!timestamp) {
      return '-';
    }

    const date = new Date(timestamp);
    return date.getHours().toString().padStart(2, '0') + ':' +
      date.getMinutes().toString().padStart(2, '0');
  }

  private getDateTimestamp(value?: string): number {
    if (!value) {
      return 0;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }
}
