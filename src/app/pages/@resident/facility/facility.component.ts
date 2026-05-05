import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';

import { HttpService } from '../../../@service/http.service';
import { ReservationCalendarComponent } from '../../../dialog/reservation-calendar/reservation-calendar.component';
import { ReservationStatus } from '../../../interface/enum';
import { Facility, ResReservation, User } from '../../../interface/interface';
import { ReservationService } from '../../../@service/reservation.service';
import { ToastService } from '../../../@service/toast.service';

@Component({
  selector: 'app-resident-facility',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule, MatMenuModule],
  templateUrl: './facility.component.html',
  styleUrls: ['./facility.component.scss']
})
export class ResidentFacilityComponent implements OnInit, OnDestroy {
  constructor(
    private http: HttpService,
    private toast: ToastService,
    private dialog: MatDialog,
    private reservationService: ReservationService
  ) { }

  // 統一管理訂閱生命週期，避免頁面離開後還殘留 API 訂閱。
  private destroy$ = new Subject<void>();

  getFacilityUrl = '/user/facility';
  getReservationByUserIdUrl = '/reservation/byUserId';
  getReservationByFacilityIdUrl = '/reservation/byFacilityId';
  cancelReservationUrl = '/reservation/cancel';
  getUserUrl = '/user/me';

  // 目前流程只會用到當前登入者，因此這裡實際上只會放一筆 user 資料。
  user: User | null = null;
  facilities: Facility[] = [];
  userReservations: ResReservation[] = [];
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
    return this.userReservations.filter(reservation => this.reservationService.isReservationExpired(reservation)).length;
  }

  // 計算已取消的預約筆數。
  get cancelledReservationCount(): number {
    return this.userReservations.filter(
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
    return this.userReservations.filter(
      reservation =>
        reservation.status !== ReservationStatus.CANCELLED &&
        !this.reservationService.isReservationExpired(reservation)
    );
  }

  // 篩出歷史紀錄，包含已取消與已過期的預約。
  get historyReservations(): ResReservation[] {
    return this.userReservations.filter(
      reservation =>
        reservation.status === ReservationStatus.CANCELLED ||
        this.reservationService.isReservationExpired(reservation)
    );
  }

  // 找出下一筆要顯示在右側摘要的預約，優先顯示已確認項目。
  get nextReservation(): ResReservation | null {
    return this.currentReservations.find(
      reservation => reservation.status === ReservationStatus.CONFIRMED
    ) ?? this.currentReservations[0] ?? null;
  }

  /**
   * 開啟狀態說明對話框
   * @param template 模板引用
   */
  openStatusDialog(template: TemplateRef<any>): void {
    this.dialog.open(template, {
      width: '320px',
      maxWidth: '90vw',
      panelClass: 'status-info-dialog'
    });
  }

  // 元件初始化時先抓設施清單，再取得登入住戶資料與其預約紀錄。
  ngOnInit(): void {
    this.getFacility();

    // 先拿到當前使用者，再依 userId 載入住戶自己的預約資料。
    this.http.getApi<User>(this.getUserUrl).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.user = res;
        if (this.user?.userId) {
          this.reservationService.getUserReservations(this.user.userId).pipe(takeUntil(this.destroy$)).subscribe();
        }
      },
      error: err => {
        this.toast.error('取得使用者資料失敗 ' + err.status, 2000);
      }
    });

    this.reservationService.userReservations$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.userReservations = res;
    });
  }

  // 切換到「我的預約」分頁，並重新抓資料讓列表與 badge 保持同步。
  openMyReservations(): void {
    this.activeTab = 'my-reservations';
    this.refreshReservations();
  }

  // 切換到「歷史紀錄」分頁，並重新抓資料以更新取消/過期狀態。
  openHistoryReservations(): void {
    this.activeTab = 'history';
    this.refreshReservations();
  }

  private refreshReservations(): void {
    if (this.user?.userId) {
      this.reservationService.getUserReservations(this.user.userId).pipe(takeUntil(this.destroy$)).subscribe();
    }
  }

  // 設施列表是住戶頁面的主資料，進頁時先載入。
  // 抓取住戶可看到的公共設施清單，並將未開放的設施排到最下方。
  getFacility(): void {
    this.http.getApi<Array<Facility>>(this.getFacilityUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          if (res) {
            // 將未開放的設施排到最下面
            this.facilities = res.sort((a, b) => {
              const aIsOpen = this.isFacilityOpen(a);
              const bIsOpen = this.isFacilityOpen(b);
              return (bIsOpen ? 1 : 0) - (aIsOpen ? 1 : 0);
            });
          }
        },
        error: err => {
          this.toast.error('取得設施失敗 ' + err.status, 2000);
        }
      });
  }

  // 檢查設施目前是否在開放時間內
  isFacilityOpen(facility: Facility): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    const openHour = parseInt(facility.openTime.split(':')[0], 10);
    const closeHour = parseInt(facility.closeTime.split(':')[0], 10);
    return currentHour >= openHour && currentHour < closeHour;
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

    if (this.reservationService.isReservationExpired(reservation)) {
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

    if (this.reservationService.isReservationExpired(reservation)) {
      return 'status-expired';
    }

    return reservation.status === ReservationStatus.CONFIRMED
      ? 'status-confirmed'
      : 'status-pending';
  }

  // 判斷這筆預約是否仍可取消，只有已確認且未過期的預約可取消。
  canCancelReservation(reservation: ResReservation): boolean {
    return reservation.status === ReservationStatus.CONFIRMED && !this.reservationService.isReservationExpired(reservation);
  }

  // 開啟日曆前先抓這個設施既有預約，讓 dialog 能判斷時段是否可用。
  // 開啟預約日曆前，先抓取該設施既有預約資料並傳入 dialog。
  openRC(facility: Facility): void {
    this.http.getApi<Array<ResReservation>>(this.getReservationByFacilityIdUrl, facility.facilityId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          const dialogRef = this.dialog.open(ReservationCalendarComponent, {
            data: {
              facility,
              reservations: res
            },
            disableClose: false,
            width: '800px',
            maxWidth: '95vw',
            panelClass: 'reservation-calendar-dialog'
          });

          dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe({
            next: dialogResult => {
              if (dialogResult) {
                this.toast.success('預約成功', 2000);
                this.refreshReservations();
              }
            }
          });
        },
        error: err => {
          this.toast.error('取得設施預約資料失敗 ' + err.status, 2000);
        }
      });
  }

  // 安全格式化時間，避免 slice 報錯
  formatTime(time: string | undefined): string {
    if (!time) return '--:--';
    return time.slice(0, 5);
  }

  // 取消成功後重新抓一次，讓列表和 badge 一起更新。
  // 跳出確認後取消指定預約，成功後重新整理列表與摘要數字。
  openCancelConfirm(id: number): void {
    if (confirm('確定要取消這筆預約嗎？')) {
      this.http.putApi(this.cancelReservationUrl, id).pipe(takeUntil(this.destroy$)).subscribe({
        next: res => {
          if (res) {
            this.toast.success('取消預約成功', 2000);
            this.refreshReservations();
          }
        },
        error: err => {
          this.toast.error('取消預約失敗 ' + err.status, 2000);
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

  // 元件銷毀時關閉所有訂閱，避免記憶體洩漏。
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
