import { PackageService } from './../../@service/package.service';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AnnouncementService } from '../../services/announcement.service';
import { StatisticsService } from '../../@service/statistics.service';
import { PackageStatus } from '../../interface/enum';

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
    { label: '總住戶人數', value: '342', icon: 'people',      color: '#3f51b5', bg: '#e8eaf6' },
    { label: '今日訪客',   value: '23',  icon: 'person_add',  color: '#0288d1', bg: '#e1f5fe' },
    { label: '待處理報修', value: '8',   icon: 'build',       color: '#f57c00', bg: '#fff3e0' },
    { label: '未取包裹',   value: '15',  icon: 'inventory_2', color: '#388e3c', bg: '#e8f5e9' },
  ];

  announcements!: any;

  // ===== 最近訪客資料 =====
  // TODO: 之後改成呼叫 GET /api/v1/visitors?limit=3 取得最新3筆訪客記錄
  recentVisitors = [
    { name: '王小明', unit: 'A棟3樓', time: '10:30', status: '在內' },
    { name: '李美華', unit: 'B棟5樓', time: '09:15', status: '已離' },
    { name: '陳大文', unit: 'C棟1樓', time: '08:45', status: '已離' },
  ];

  constructor(
    private announcementService: AnnouncementService,
    private statisticsService: StatisticsService,
    private packageService: PackageService
  ) {}

  ngOnInit(): void {
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
      (res: number) =>
      this.stats[0].value = res.toString()
    )
  }
}
