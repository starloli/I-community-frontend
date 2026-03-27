import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { HttpService } from '../../../@service/http.service';
import { Facility, Reservation, ResReservation, User } from '../../../interface/interface';
import { ReservationStatus } from '../../../interface/enum';
import { ReserveFacilityComponent } from '../../../dialog/reserve-facility/reserve-facility.component';
import { Subject, takeUntil } from 'rxjs';
import { ReservationCalendar } from '../../../dialog/reservation-calendar/reservation-calendar';

@Component({
  selector: 'app-resident-facility',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.scss'
})
export class ResidentFacilityComponent implements OnInit, OnDestroy {

  constructor(
    private http: HttpService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) { }

  private destroy$ = new Subject<void>();

  getFacilityUrl = "http://localhost:8083/user/facilities";
  getReservationByUserIdUrl = "http://localhost:8083/user/reservationsByUserId";
  getReservationByFacilityIdUrl = "http://localhost:8083/user/reservationsByFacilityId";
  cancelReservationUrl = "http://localhost:8083/user/cancelReservation";
  getUserUrl = 'http://localhost:8083/user/me'

  user: User[] = []


  // ── 設施列表 ──────────────────────────────────────
  facilities: Facility[] = [];

  // ── 我的預約記錄 ──────────────────────────────────
  // TODO: GET /reservations/my（帶 token）
  myReservations: ResReservation[] = [];
  myRConut: number = 0;


  // ── 目前顯示的 tab ────────────────────────────────
  activeTab: 'facilities' | 'my-reservations' = 'facilities';

  ReservationStatus = ReservationStatus;

  ngOnInit() {
    this.getFacility();
    // 獲取使用者資訊
    this.http.getApi<User>(this.getUserUrl).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        this.user.push(res);
      },
      error: err => {
        this.snackBar.open('載入使用者失敗：' + err.status, '關閉', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  getReservation() {
    this.myRConut = 0;
    // 獲取預約記錄

    const statusOrder = {
      [ReservationStatus.CONFIRMED]: 1,
      [ReservationStatus.CONFIRMING]: 2,
      [ReservationStatus.CANCELLED]: 3,
    }

    this.http.getApi<Array<ResReservation>>(this.getReservationByUserIdUrl, this.user[0].userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          res.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
          if (res) {
            this.myReservations = res;
            for (let m of this.myReservations) {
              if (m.status === ReservationStatus.CONFIRMED)
                this.myRConut++;
            }
          }
        },
        error: err => {
          this.snackBar.open('載入預約失敗：' + err.status, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      }
      )
  }

  getFacility() {
    this.http.getApi<Array<Facility>>(this.getFacilityUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          if (res) {
            this.facilities = res;
          }
        },
        error: err => {
          this.snackBar.open('載入設施失敗：' + err.status, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
  }

  // ── 設施 icon ────────────────────────────────────
  getFacilityIcon(name: string): string {
    if (name.includes('健身')) return 'fitness_center';
    if (name.includes('游泳')) return 'pool';
    if (name.includes('會議')) return 'meeting_room';
    if (name.includes('交誼')) return 'groups';
    if (name.includes('兒童')) return 'child_care';
    return 'apartment';
  }

  // ── 開啟預約 Dialog ──────────────────────────────
  openRC(facility: Facility) {
    this.http.getApi<Array<ResReservation>>(this.getReservationByFacilityIdUrl, facility.facilityId)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: res => {
          const dialogRef = this.dialog.open(ReservationCalendar, {
            data: {
              facility: facility,
              reservations: res
            },
            disableClose: false
          });
          dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe({
            next: res => {
              if (res) {
                this.snackBar.open('預約成功', '關閉', {
                  duration: 2000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top'
                });
              }
            }
          });
        },
        error: err => {
          this.snackBar.open('載入預約失敗：' + err.status, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          })
        }
      })
  }

  // ── 取消預約 ──────────────────────────────────────
  openCancelConfirm(id: number) {
    // 使用確認 dialog
    if (confirm('確定要取消預約嗎？')) {
      this.http.putApi(this.cancelReservationUrl, id).pipe(takeUntil(this.destroy$)).subscribe({
        next: res => {
          if (res) {
            this.snackBar.open('取消預約成功', '關閉', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
          this.getReservation();
        },
        error: err => {
          this.snackBar.open('取消預約失敗：' + err.status, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      });
    }
    this.getReservation();
  }

  // ── 格式化日期 ────────────────────────────────────
  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
