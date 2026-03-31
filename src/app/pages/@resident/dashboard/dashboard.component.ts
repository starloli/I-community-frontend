import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resident-dashboard',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class ResidentDashboardComponent implements OnInit {
  userName = '住戶';
  unitNumber = '';

  // TODO: 接後端統計 API 後，這裡可以改成動態資料。
  stats = [
    { label: '未繳帳單', value: '2', icon: 'receipt_long', color: '#B8935A', bg: 'rgba(184,147,90,0.12)', route: '/resident/bill' },
    { label: '待領包裹', value: '3', icon: 'inventory_2', color: '#7BA89E', bg: 'rgba(123,168,158,0.12)', route: '/resident/package' },
    { label: '報修進度', value: '1', icon: 'build', color: '#C47A5A', bg: 'rgba(196,122,90,0.12)', route: '/resident/repair' },
    { label: '設施預約', value: '1', icon: 'meeting_room', color: '#7B7FBA', bg: 'rgba(123,127,186,0.12)', route: '/resident/facility' }
  ];

  // TODO: GET /announcements?limit=3
  announcements = [
    { title: '電梯維修公告', date: '2026-03-16', category: '維修' },
    { title: '社區節慶活動通知', date: '2026-03-15', category: '活動' },
    { title: '一般通知', date: '2026-03-14', category: '公告' }
  ];

  // TODO: GET /packages/my?status=WAITING&limit=3
  myPackages = [
    { courier: '黑貓宅急便', arrivedAt: '03/21 09:30', trackingNumber: 'SF1234567890' },
    { courier: '宅配通', arrivedAt: '03/20 14:15', trackingNumber: 'EC9876543210' },
    { courier: '中華郵政', arrivedAt: '03/19 11:00', trackingNumber: 'PC2468013579' }
  ];

  visitorHighlights = [
    '可提前登記訪客資訊，減少櫃台等待時間',
    '可查詢訪客進出紀錄與目前狀態',
    '支援住戶自行新增與管理訪客資料'
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  private loadUserInfo(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userName = payload.fullName || payload.sub || '住戶';
      this.unitNumber = payload.unitNumber || '';
    } catch {
      this.userName = '住戶';
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
