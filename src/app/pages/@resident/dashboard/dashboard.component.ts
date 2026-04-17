import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { AnnouncementService } from '../../../@service/announcement.service';
import { HttpService } from '../../../@service/http.service';
import { PackageService } from '../../../@service/package.service';
import { BillService } from '../../../@service/bill.service';
import { RepairService } from '../../../@service/repair.service';
import { ReservationService } from '../../../@service/reservation.service';
import { StatisticsService } from '../../../@service/statistics.service';
import { BillStatus, PackageStatus, RepairStatus, ReservationStatus } from '../../../interface/enum';
import { Announcement, Bill, Package, RepairRequest, ResReservation, User } from '../../../interface/interface';

@Component({
  selector: 'app-resident-dashboard',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class ResidentDashboardComponent implements OnInit, OnDestroy {
  userName = '住戶';
  unitNumber = '';
  getUserUrl = '/user/me';
  private $destroy = new Subject<void>();

  stats = [
    { label: '未繳帳單', value: '0', icon: 'receipt_long', color: '#B8935A', bg: 'rgba(184,147,90,0.12)', route: '/resident/bill' },
    { label: '待領包裹', value: '0', icon: 'inventory_2', color: '#7BA89E', bg: 'rgba(123,168,158,0.12)', route: '/resident/package' },
    { label: '報修進度', value: '0', icon: 'build', color: '#C47A5A', bg: 'rgba(196,122,90,0.12)', route: '/resident/repair' },
    { label: '設施預約', value: '0', icon: 'meeting_room', color: '#7B7FBA', bg: 'rgba(123,127,186,0.12)', route: '/resident/facility' }
  ];

  announcements: Array<{ title: string; date: string; category: string }> = [];
  myPackages: Array<{ courier: string; arrivedAt: string; trackingNumber: string }> = [];

  visitorHighlights = [
    '可提前登記訪客資訊，減少櫃台等待時間',
    '可查詢訪客進出紀錄與目前狀態',
    '支援住戶自行新增與管理訪客資料'
  ];

  constructor(
    private router: Router,
    private http: HttpService,
    private announcementService: AnnouncementService,
    private packageService: PackageService,
    private billService: BillService,
    private repairService: RepairService,
    private reservationService: ReservationService,
    private statisticsService: StatisticsService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadAnnouncements();
    this.loadPackages();
    this.loadBillStats();
    this.loadRepairStats();
    this.loadReservationStats();
  }

  private loadUserInfo(): void {
    this.http.getApi<User>(this.getUserUrl).pipe(takeUntil(this.$destroy)).subscribe({
      next: (user) => {
        this.userName = user.fullName || user.userName || '住戶';
        this.unitNumber = user.unitNumber || '';
        // After user info is loaded, we can fetch user-specific reservations
        if (user.userId) {
          this.reservationService.getUserReservations(user.userId).pipe(takeUntil(this.$destroy)).subscribe();
        }
      },
      error: () => {
        this.loadUserInfoFromToken();
      }
    });
  }

  private loadUserInfoFromToken(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      this.userName = '住戶';
      this.unitNumber = '';
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userName = payload.fullName || payload.sub || '住戶';
      this.unitNumber = payload.unitNumber || '';
      if (payload.userId) {
        this.reservationService.getUserReservations(Number(payload.userId)).pipe(takeUntil(this.$destroy)).subscribe();
      }
    } catch {
      this.userName = '住戶';
      this.unitNumber = '';
    }
  }

  private loadAnnouncements(): void {
    this.announcementService.getAll().subscribe();
    this.announcementService.announs$
      .pipe(takeUntil(this.$destroy))
      .subscribe((data: Announcement[]) => {
        this.announcements = [...data]
          .sort((a, b) => this.getDateTimestamp(b.publishedAt) - this.getDateTimestamp(a.publishedAt))
          .slice(0, 3)
          .map(item => ({
            title: item.title,
            date: this.formatAnnouncementDate(item.publishedAt),
            category: item.category
          }));
      });
  }

  private loadPackages(): void {
    this.packageService.getUserAll().subscribe();
    this.packageService.userPackages$
      .pipe(takeUntil(this.$destroy))
      .subscribe((data: Package[]) => {
        const waitingPackages = data
          .map(pkg => this.normalizePackage(pkg))
          .filter(pkg => pkg.status === PackageStatus.WAITING)
          .sort((a, b) => this.getDateTimestamp(b.arrivedAt) - this.getDateTimestamp(a.arrivedAt));

        this.stats[1].value = waitingPackages.length.toString();
        this.myPackages = waitingPackages.slice(0, 3).map(pkg => ({
          courier: pkg.courier,
          arrivedAt: this.formatPackageDate(pkg.arrivedAt),
          trackingNumber: pkg.trackingNumber
        }));
      });
  }

  private loadBillStats(): void {
    this.billService.getMyBills().pipe(takeUntil(this.$destroy)).subscribe(); // Ensure bills are fetched
    this.billService.bills$
      .pipe(takeUntil(this.$destroy))
      .subscribe((bills: any[]) => {
        // 使用和帳單頁面相同的篩選條件：status === '待繳'
        const count = bills.filter(bill => bill.status === '待繳' || bill.status === 'UNPAID').length;
        this.stats[0].value = count.toString();
      });
  }

  private loadRepairStats(): void {
    this.repairService.getUserAll().pipe(takeUntil(this.$destroy)).subscribe(); // Ensure repairs are fetched
    this.repairService.userRepairs$
      .pipe(takeUntil(this.$destroy))
      .subscribe((repairs: RepairRequest[]) => {
        const pendingRepairs = repairs.filter(repair => repair.status === RepairStatus.PENDING);
        this.stats[2].value = pendingRepairs.length.toString();
      });
  }

  private loadReservationStats(): void {
    this.reservationService.getConfirmedReservationCount()
      .pipe(takeUntil(this.$destroy))
      .subscribe((count: number) => {
        this.stats[3].value = count.toString();
      });
  }

  private normalizePackage(pkg: any): any {
    const rawStatus = pkg.status || PackageStatus.WAITING;

    return {
      ...pkg,
      trackingNumber: pkg.trackingNumber || pkg['trackingNo'] || '',
      courier: pkg.courier || pkg['deliveryCompany'] || '其他',
      arrivedAt: pkg.arrivedAt || pkg['createdAt'] || '',
      status: rawStatus === 'PICKED' ? PackageStatus.PICKED_UP : rawStatus
    };
  }

  private formatAnnouncementDate(value?: string): string {
    if (!value) {
      return '--';
    }

    return new Date(value).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  private formatPackageDate(value?: string): string {
    if (!value) {
      return '--';
    }

    return new Date(value).toLocaleString('zh-TW', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  private getDateTimestamp(value?: string): number {
    if (!value) {
      return 0;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 0 : date.getTime();
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
