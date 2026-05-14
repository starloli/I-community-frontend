import { CommonModule, formatDate } from '@angular/common';
import { Component, Inject, Injectable, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CalendarDateFormatter, CalendarEvent, CalendarModule, CalendarView, CalendarWeekViewBeforeRenderEvent, DateFormatterParams } from 'angular-calendar';
import { startOfDay, addHours, addMinutes } from 'date-fns';
import { Facility, ResReservation } from '../../interface/interface';
import { ReserveFacilityComponent } from '../reserve-facility/reserve-facility.component';
import { takeUntil } from 'rxjs';
import { parse } from 'date-fns';
import { ToastService } from '../../@service/toast.service';
import { HttpService } from '../../@service/http.service';
import { ReservationService } from '../../@service/reservation.service';

@Injectable()
class ReservationCalendarDateFormatter extends CalendarDateFormatter {
  override weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'EEE', locale || 'zh-TW');
  }

  override weekViewColumnSubHeader({ date, locale }: DateFormatterParams): string {
    return formatDate(date, 'M/d', locale || 'zh-TW');
  }
}

@Component({
  selector: 'app-reservation-calendar',
  standalone: true,
  imports: [CalendarModule, CommonModule],
  templateUrl: './reservation-calendar.component.html',
  styleUrls: ['./reservation-calendar.component.scss'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: ReservationCalendarDateFormatter
    }
  ]
})
export class ReservationCalendarComponent implements OnInit {
  constructor(
    private dialogRefSelf: MatDialogRef<ReservationCalendarComponent>,
    private dialog: MatDialog,
    private toast: ToastService,
    private http: HttpService,
    private reservationService: ReservationService,
    @Inject(MAT_DIALOG_DATA) public data: { facility: Facility }
  ) {
  }

  getReservationByFacilityIdUrl = '/reservation/byFacilityId';

  // 顯示週視圖
  view: CalendarView = CalendarView.Week;
  // 當前日期
  viewDate: Date = new Date();

  openTime: number = 0;
  closeTime: number = 24;

  // 這是行事曆的核心：事件陣列
  events: CalendarEvent[] = [];
  eventColors = {
    available: { primary: '#D6EAF8', secondary: '#206894' },  // 淺藍色背景，深藍色文字
    warning: { primary: '#FCF3CF', secondary: '#ae7802' },    // 淺黃色背景，深橘色文字
    full: { primary: '#FADBD8', secondary: '#ad1c0f' }        // 淺紅色背景，深紅色文字
  };

  ngOnInit(): void {
    this.openTime = Number(this.data.facility.openTime.split(':')[0]);
    this.closeTime = Number(this.data.facility.closeTime.split(':')[0]) - 1;
    this.getFacilityReservations();
  }

  getFacilityReservations(): void {
    this.http.getApi<Array<ResReservation>>(this.getReservationByFacilityIdUrl, this.data.facility.facilityId)
      .pipe(takeUntil(this.dialogRefSelf.afterClosed()))
      .subscribe({
        next: res => {
          this.events = this.sortReservations(res.filter(r =>
            this.reservationService.isReservationExpired(r) ? false : true
          )).map((reservation): CalendarEvent => {
            let full = reservation.attendees >= this.data.facility.capacity;
            return {
              start: addHours(startOfDay(new Date(reservation.date)), Number(reservation.startTime.split(':')[0])),
              end: addHours(startOfDay(new Date(reservation.date)), Number(reservation.endTime.split(':')[0])),
              title: full ? '已額滿' : `尚有${this.data.facility.capacity - reservation.attendees}位空位`,
              color: full ? this.eventColors.full : reservation.attendees >= this.data.facility.capacity / 2 ? this.eventColors.warning : this.eventColors.available,
              meta: {
                data: {
                  ...reservation,
                  attendees: this.data.facility.capacity - reservation.attendees
                },
                full: full
              } // 你可以自定義額外資訊
            }
          })
        },
        error: err => {
          this.toast.error('取得設施預約資料失敗 ' + err.status, 2000);
        }
      });
  }

  // 當使用者點擊時間格子時觸發
  hourSegmentClicked(time: Date) {
    if (this.isSlotUnavailable(time)) {
      console.log('NO');
      // 你可以在這裡跳出 MatDialog 進行預約
    } else {
      const dialogRef = this.dialog.open(ReserveFacilityComponent, {
        data: { facility: this.data.facility, time: time },
      });
      dialogRef.afterClosed().pipe(takeUntil(this.dialogRefSelf.afterClosed())).subscribe({
        next: res => {
          if (res) {
            this.toast.success('預約成功', 2000);
            // this.dialogRefSelf.close(true);
              this.getFacilityReservations(); // 預約成功後更新行事曆事件
          }
        },
        error: err => {
          this.toast.error(err.error.message, 2000);
          console.log(err.error.message);
        }
      })
    }
  }

  onEventClick(event: CalendarEvent) {
    const time = event.start;

    if (this.isSlotUnavailable(time)) {
      console.log('NO');
    } else {
      if (this.events.some(event => event.start.getTime() === time.getTime() && event.meta.full)) {
        this.toast.warning('這個時段已經額滿了喔', 2000)
        return;
      } else {
        const dialogRef = this.dialog.open(ReserveFacilityComponent, {
          data: {
            facility:
            {
              ...this.data.facility,
              capacity: event.meta.data.attendees
            }
            , time: time
          },
        });
        dialogRef.afterClosed().pipe(takeUntil(this.dialogRefSelf.afterClosed())).subscribe({
          next: res => {
            if (res) {
              this.toast.success('預約成功', 2000);
              // this.dialogRefSelf.close(true);
              this.getFacilityReservations(); // 預約成功後更新行事曆事件
            }
          },
          error: err => {
            this.toast.error(err.error.message, 2000);
            console.log(err.error.message);
          }
        })
      }
    }
  }

  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach((column) => {
      column.hours.forEach((hour) => {
        // 改成遍歷所有 segments，不只取 [0]
        hour.segments.forEach((segment) => {
          const unavailableReason = this.getSlotUnavailableReason(segment.date);
          if (unavailableReason) {
            segment.cssClass = ((segment.cssClass || '') + ' cal-disabled').trim();
          }
        });
      });
    });
  }

  private isSlotUnavailable(time: Date): boolean {
    return this.getSlotUnavailableReason(time) !== null;
  }

  private getSlotUnavailableReason(time: Date): 'beforeOpen' | 'afterClose' | 'past' | null {
    const hour = time.getHours();
    const facilityOpenHour = Number(this.data.facility.openTime.split(':')[0]);
    const facilityCloseHour = Number(this.data.facility.closeTime.split(':')[0]);

    const now = new Date();
    const timeDay = new Date(time.getFullYear(), time.getMonth(), time.getDate());
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const isSameDay = timeDay.getTime() === today.getTime();
    const isPastDay = timeDay.getTime() < today.getTime();

    // 無視分鐘數，只比較小時
    if (isPastDay || (isSameDay && hour <= now.getHours())) {
      return 'past';
    }

    if (hour >= facilityCloseHour) {
      return 'afterClose';
    }

    if (hour < facilityOpenHour) {
      return 'beforeOpen';
    }

    return null;
  }

  changeWeek(i: number) {
    if (i === 1) {
      this.viewDate = addHours(this.viewDate, 7 * 24);
    } else if (i === -1) {
      this.viewDate = addHours(this.viewDate, -7 * 24);
    } else if (i === 0) {
      this.viewDate = new Date();
    } else {
      this.toast.warning('亂輸入啥毛毛呢', 2000)
    }
  }

  sortReservations(resvation: ResReservation[]): Re[] {
    const res = Object.values(
      resvation.reduce((acc, curr) => {
        if (!acc[curr.date + '' + curr.startTime]) {
          acc[curr.date + '' + curr.startTime] = curr;
        } else {
          acc[curr.date + '' + curr.startTime].attendees += curr.attendees;
        }
        return acc;
      }, {} as Record<string, ResReservation>))
      .sort((a, b) => {
        const timeA = parse(a.date + ' ' + a.startTime, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime();
        const timeB = parse(b.date + ' ' + b.startTime, 'yyyy-MM-dd HH:mm:ss', new Date()).getTime();
        return timeA - timeB;
      }).map(res => {
        return {
          date: res.date,
          startTime: res.startTime,
          endTime: res.endTime,
          attendees: res.attendees
        }
      });
    return res;
  }
}

interface Re {
  date: string,
  startTime: string,
  endTime: string,
  attendees: number
}
