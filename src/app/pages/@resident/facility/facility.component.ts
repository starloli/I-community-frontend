import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { HttpService } from '../../../@service/http.service';
import { ReservationCalendar } from '../../../dialog/reservation-calendar/reservation-calendar';
import { ReservationStatus } from '../../../interface/enum';
import { Facility, ResReservation, User } from '../../../interface/interface';

@Component({
  selector: 'app-resident-facility',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './facility.component.html',
  styleUrls: ['./facility.component.scss']
})
export class ResidentFacilityComponent implements OnInit, OnDestroy {
  constructor(
    private http: HttpService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  // 統一管理訂閱生命週期，避免頁面離開後還殘留 API 訂閱。
  private destroy$ = new Subject<void>();

  getFacilityUrl = 'http://localhost:8083/user/facilities';
  getReservationByUserIdUrl = 'http://localhost:8083/user/reservationsByUserId';
  getReservationByFacilityIdUrl = 'http://localhost:8083/user/reservationsByFacilityId';
  cancelReservationUrl = 'http://localhost:8083/user/cancelReservation';
  getUserUrl = 'http://localhost:8083/user/me';

  // 目前流程只會用到當前登入者，因此這裡實際上只會放一筆 user 資料。
  user: User[] = [];
  facilities: Facility[] = [];
  reservations: ResReservation[] = [];
  activeTab: 'facilities' | 'my-reservations' | 'history' = 'facilities';

  ReservationStatus = ReservationStatus;

  // badge 直接從有效預約即時計算，避免 count 與列表不同步而閃跳。
  get confirmedReservationCount(): number {
    return this.currentReservations.filter(
      reservation => reservation.status === ReservationStatus.CONFIRMED
    ).length;
  }

  get pendingReservationCount(): number {
    return this.currentReservations.filter(
      reservation => reservation.status === ReservationStatus.CONFIRMING
    ).length;
  }

  get expiredReservationCount(): number {
    return this.reservations.filter(reservation => this.isReservationExpired(reservation)).length;
  }

  get cancelledReservationCount(): number {
    return this.reservations.filter(
      reservation => reservation.status === ReservationStatus.CANCELLED
    ).length;
  }

  get historyReservationCount(): number {
    return this.historyReservations.length;
  }

  get reservationBadgeLabel(): string {
    return this.confirmedReservationCount > 99 ? '99+' : `${this.confirmedReservationCount}`;
  }

  // 我的預約只保留仍有效的資料，已取消和已過期都移到歷史紀錄。
  get currentReservations(): ResReservation[] {
    return this.reservations.filter(
      reservation =>
        reservation.status !== ReservationStatus.CANCELLED &&
        !this.isReservationExpired(reservation)
    );
  }

  get historyReservations(): ResReservation[] {
    return this.reservations.filter(
      reservation =>
        reservation.status === ReservationStatus.CANCELLED ||
        this.isReservationExpired(reservation)
    );
  }

  get nextReservation(): ResReservation | null {
    return this.currentReservations.find(
      reservation => reservation.status === ReservationStatus.CONFIRMED
    ) ?? this.currentReservations[0] ?? null;
  }

  ngOnInit(): void {
    this.getFacility();

    // 先拿到當前使用者，再依 userId 載入住戶自己的預約資料。
    this.http.getApi<User>(this.getUserUrl).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.user = [res];
        this.getReservation();
      },
      error: err => {
        this.snackBar.open('取得使用者資料失敗 ' + err.status, '關閉', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  openMyReservations(): void {
    this.activeTab = 'my-reservations';
    this.getReservation();
  }

  openHistoryReservations(): void {
    this.activeTab = 'history';
    this.getReservation();
  }

  getReservation(): void {
    const userId = this.user[0]?.userId;
    if (!userId) {
      return;
    }

    this.http.getApi<Array<ResReservation>>(this.getReservationByUserIdUrl, userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.reservations = [...(res ?? [])].sort(
            (a, b) => this.getReservationSortTime(b) - this.getReservationSortTime(a)
          );
        },
        error: err => {
          this.snackBar.open('取得預約失敗 ' + err.status, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
  }

  // 設施列表是住戶頁面的主資料，進頁時先載入。
  getFacility(): void {
    this.http.getApi<Array<Facility>>(this.getFacilityUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          if (res) {
            this.facilities = res;
          }
        },
        error: err => {
          this.snackBar.open('取得設施失敗 ' + err.status, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
  }

  // 依名稱給對應 icon，讓常見設施有更直覺的視覺辨識。
  getFacilityIcon(name: string): string {
    if (name.includes('健身')) return 'fitness_center';
    if (name.includes('游泳')) return 'pool';
    if (name.includes('會議')) return 'meeting_room';
    if (name.includes('球場')) return 'groups';
    if (name.includes('兒童')) return 'child_care';
    return 'apartment';
  }

  getReservationStatusLabel(reservation: ResReservation): string {
    if (reservation.status === ReservationStatus.CANCELLED) {
      return '已取消';
    }

    if (this.isReservationExpired(reservation)) {
      return '已過期';
    }

    if (reservation.status === ReservationStatus.CONFIRMED) {
      return '已確認';
    }

    return '確認中';
  }

  getReservationStatusClass(reservation: ResReservation): string {
    if (reservation.status === ReservationStatus.CANCELLED) {
      return 'status-cancelled';
    }

    if (this.isReservationExpired(reservation)) {
      return 'status-expired';
    }

    return reservation.status === ReservationStatus.CONFIRMED
      ? 'status-confirmed'
      : 'status-pending';
  }

  canCancelReservation(reservation: ResReservation): boolean {
    return reservation.status === ReservationStatus.CONFIRMED && !this.isReservationExpired(reservation);
  }

  isReservationExpired(reservation: ResReservation): boolean {
    const reservationEnd = this.buildReservationDateTime(reservation.date, reservation.endTime);
    if (!reservationEnd) {
      return false;
    }

    return reservationEnd.getTime() < Date.now();
  }

  // 開啟日曆前先抓這個設施既有預約，讓 dialog 能判斷時段是否可用。
  openRC(facility: Facility): void {
    this.http.getApi<Array<ResReservation>>(this.getReservationByFacilityIdUrl, facility.facilityId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          const dialogRef = this.dialog.open(ReservationCalendar, {
            data: {
              facility,
              reservations: res
            },
            disableClose: false
          });

          dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe({
            next: dialogResult => {
              if (dialogResult) {
                this.snackBar.open('預約成功', '關閉', {
                  duration: 2000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top'
                });
                this.getReservation();
              }
              this.getReservation();
            }
          });
        },
        error: err => {
          this.snackBar.open('取得設施預約資料失敗 ' + err.status, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
  }

  // 取消成功後重新抓一次，讓列表和 badge 一起更新。
  openCancelConfirm(id: number): void {
    if (confirm('確定要取消這筆預約嗎？')) {
      this.http.putApi(this.cancelReservationUrl, id).pipe(takeUntil(this.destroy$)).subscribe({
        next: res => {
          if (res) {
            this.snackBar.open('取消預約成功', '關閉', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.getReservation();
          }
        },
        error: err => {
          this.snackBar.open('取消預約失敗 ' + err.status, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  private getReservationSortTime(reservation: ResReservation): number {
    const reservationStart = this.buildReservationDateTime(reservation.date, reservation.startTime);
    return reservationStart?.getTime() ?? 0;
  }

  private buildReservationDateTime(date: string, time: string): Date | null {
    if (!date || !time) {
      return null;
    }

    const safeTime = time.length === 5 ? `${time}:00` : time;
    const parsed = new Date(`${date}T${safeTime}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
