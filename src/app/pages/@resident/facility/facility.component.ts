import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { HttpService } from '../../../@service/http.service';
import { ReservationCalendar } from '../../../dialog/reservation-calendar/reservation-calendar.component';
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
  // 計算目前有效預約中，狀態為「已確認」的筆數，提供 tab badge 與摘要卡顯示。
  get confirmedReservationCount(): number {
    return this.currentReservations.filter(
      reservation => reservation.status === ReservationStatus.CONFIRMED
    ).length;
  }

  // 計算目前有效預約中，仍在等待確認的筆數。
  get pendingReservationCount(): number {
    return this.currentReservations.filter(
      reservation => reservation.status === ReservationStatus.CONFIRMING
    ).length;
  }

  // 計算所有預約中已經過期的筆數，供歷史紀錄摘要使用。
  get expiredReservationCount(): number {
    return this.reservations.filter(reservation => this.isReservationExpired(reservation)).length;
  }

  // 計算已取消的預約筆數。
  get cancelledReservationCount(): number {
    return this.reservations.filter(
      reservation => reservation.status === ReservationStatus.CANCELLED
    ).length;
  }

  // 歷史紀錄總數，包含已取消與已過期的預約。
  get historyReservationCount(): number {
    return this.historyReservations.length;
  }

  // 將 badge 顯示文字控制在 99+ 以內，避免數字太長撐壞按鈕。
  get reservationBadgeLabel(): string {
    return this.confirmedReservationCount > 99 ? '99+' : `${this.confirmedReservationCount}`;
  }

  // 我的預約只保留仍有效的資料，已取消和已過期都移到歷史紀錄。
  // 篩出目前仍有效的預約，排除已取消與已過期項目。
  get currentReservations(): ResReservation[] {
    return this.reservations.filter(
      reservation =>
        reservation.status !== ReservationStatus.CANCELLED &&
        !this.isReservationExpired(reservation)
    );
  }

  // 篩出歷史紀錄，包含已取消與已過期的預約。
  get historyReservations(): ResReservation[] {
    return this.reservations.filter(
      reservation =>
        reservation.status === ReservationStatus.CANCELLED ||
        this.isReservationExpired(reservation)
    );
  }

  // 找出下一筆要顯示在右側摘要的預約，優先顯示已確認項目。
  get nextReservation(): ResReservation | null {
    return this.currentReservations.find(
      reservation => reservation.status === ReservationStatus.CONFIRMED
    ) ?? this.currentReservations[0] ?? null;
  }

  // 元件初始化時先抓設施清單，再取得登入住戶資料與其預約紀錄。
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

  // 切換到「我的預約」分頁，並重新抓資料讓列表與 badge 保持同步。
  openMyReservations(): void {
    this.activeTab = 'my-reservations';
    this.getReservation();
  }

  // 切換到「歷史紀錄」分頁，並重新抓資料以更新取消/過期狀態。
  openHistoryReservations(): void {
    this.activeTab = 'history';
    this.getReservation();
  }

  // 依目前登入住戶抓取所有預約資料，並依預約開始時間排序。
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
  // 抓取住戶可看到的公共設施清單。
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
  // 根據設施名稱回傳對應的 Material icon，讓卡片更容易辨識。
  getFacilityIcon(name: string): string {
    if (name.includes('健身')) return 'fitness_center';
    if (name.includes('游泳')) return 'pool';
    if (name.includes('會議')) return 'meeting_room';
    if (name.includes('球場')) return 'groups';
    if (name.includes('兒童')) return 'child_care';
    return 'apartment';
  }

  // 將預約狀態轉成畫面上顯示的中文文字。
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

  // 依預約狀態回傳對應的樣式 class，控制 badge 顏色。
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

  // 判斷這筆預約是否仍可取消，只有已確認且未過期的預約可取消。
  canCancelReservation(reservation: ResReservation): boolean {
    return reservation.status === ReservationStatus.CONFIRMED && !this.isReservationExpired(reservation);
  }

  // 用預約結束時間判斷是否已過期。
  isReservationExpired(reservation: ResReservation): boolean {
    const reservationEnd = this.buildReservationDateTime(reservation.date, reservation.endTime);
    if (!reservationEnd) {
      return false;
    }

    return reservationEnd.getTime() < Date.now();
  }

  // 開啟日曆前先抓這個設施既有預約，讓 dialog 能判斷時段是否可用。
  // 開啟預約日曆前，先抓取該設施既有預約資料並傳入 dialog。
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
            disableClose: false,
            panelClass: 'reservation-calendar-dialog'
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
  // 跳出確認後取消指定預約，成功後重新整理列表與摘要數字。
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

  // 將日期格式化成 zh-TW 顯示格式，供卡片與摘要區塊使用。
  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  // 取得預約開始時間的 timestamp，方便在載入後做排序。
  private getReservationSortTime(reservation: ResReservation): number {
    const reservationStart = this.buildReservationDateTime(reservation.date, reservation.startTime);
    return reservationStart?.getTime() ?? 0;
  }

  // 將日期與時間字串組合成可比較的 Date 物件。
  private buildReservationDateTime(date: string, time: string): Date | null {
    if (!date || !time) {
      return null;
    }

    const safeTime = time.length === 5 ? `${time}:00` : time;
    const parsed = new Date(`${date}T${safeTime}`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  // 元件銷毀時關閉所有訂閱，避免記憶體洩漏。
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
