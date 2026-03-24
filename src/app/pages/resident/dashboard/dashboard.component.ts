import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-resident-dashboard',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class ResidentDashboardComponent implements OnInit {

  // ── 住戶資訊（從 JWT token 解析）──────────────────
  userName = '住戶';
  unitNumber = '';

  // ── 統計卡片（住戶專屬）──────────────────────────
  // TODO: GET /bills/my?status=UNPAID,OVERDUE → 待繳帳單數
  // TODO: GET /packages/my?status=WAITING → 未取包裹數
  // TODO: GET /repairs/my?status=PENDING,IN_PROGRESS → 處理中報修數
  // TODO: GET /reservations/my?upcoming=true → 即將到來的預約數
  stats = [
    { label: '待繳帳單', value: '2', icon: 'receipt_long', color: '#B8935A', bg: 'rgba(184,147,90,0.12)', route: '/resident/bill' },
    { label: '未取包裹', value: '3', icon: 'inventory_2', color: '#7BA89E', bg: 'rgba(123,168,158,0.12)', route: '/resident/package' },
    { label: '報修進度', value: '1', icon: 'build', color: '#C47A5A', bg: 'rgba(196,122,90,0.12)', route: '/resident/repair' },
    { label: '即將預約', value: '1', icon: 'meeting_room', color: '#7B7FBA', bg: 'rgba(123,127,186,0.12)', route: '/resident/facility' },
  ];

  // ── 最新公告 ──────────────────────────────────────
  // TODO: GET /announcements?limit=3
  announcements = [
    { title: '電梯維修公告', date: '2026-03-16', category: '維修' },
    { title: '社區清潔日通知', date: '2026-03-15', category: '活動' },
    { title: '停水通知', date: '2026-03-14', category: '公告' },
  ];

  // ── 我的包裹（待取）──────────────────────────────
  // TODO: GET /packages/my?status=WAITING&limit=3
  myPackages = [
    { courier: '順豐速運', arrivedAt: '03/21 09:30', trackingNumber: 'SF1234567890' },
    { courier: '黑貓宅急便', arrivedAt: '03/20 14:15', trackingNumber: 'EC9876543210' },
    { courier: '中華郵政', arrivedAt: '03/19 11:00', trackingNumber: 'PC2468013579' },
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadUserInfo();
  }

  private loadUserInfo() {
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

  navigateTo(route: string) {
    this.router.navigate([route]);
  }
}
