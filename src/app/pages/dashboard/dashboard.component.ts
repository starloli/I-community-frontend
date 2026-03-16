import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  // ===== 統計卡片資料 =====
  // TODO: 之後改成呼叫 GET /api/v1/dashboard/stats 取得真實數據
  stats = [
    { label: '總住戶人數', value: '342', icon: 'people',      color: '#3f51b5', bg: '#e8eaf6' },
    { label: '今日訪客',   value: '23',  icon: 'person_add',  color: '#0288d1', bg: '#e1f5fe' },
    { label: '待處理報修', value: '8',   icon: 'build',       color: '#f57c00', bg: '#fff3e0' },
    { label: '未取包裹',   value: '15',  icon: 'inventory_2', color: '#388e3c', bg: '#e8f5e9' },
  ];

  // ===== 最新公告資料 =====
  // TODO: 之後改成呼叫 GET /api/v1/announcements?limit=3 取得最新3筆公告
  announcements = [
    { title: '電梯維修公告',   date: '2026-03-16', category: '維修' },
    { title: '社區清潔日通知', date: '2026-03-15', category: '活動' },
    { title: '停水通知',       date: '2026-03-14', category: '公告' },
  ];

  // ===== 最近訪客資料 =====
  // TODO: 之後改成呼叫 GET /api/v1/visitors?limit=3 取得最新3筆訪客記錄
  recentVisitors = [
    { name: '王小明', unit: 'A棟3樓', time: '10:30', status: '在內' },
    { name: '李美華', unit: 'B棟5樓', time: '09:15', status: '已離' },
    { name: '陳大文', unit: 'C棟1樓', time: '08:45', status: '已離' },
  ];
}
