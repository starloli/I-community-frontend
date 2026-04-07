import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CalendarEvent, CalendarModule, CalendarView, CalendarWeekViewBeforeRenderEvent } from 'angular-calendar';
import { startOfDay, addHours } from 'date-fns';
import { Facility, ResReservation } from '../../interface/interface';
import { ReserveFacilityComponent } from '../reserve-facility/reserve-facility.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntil } from 'rxjs';
import { parse } from 'date-fns';

@Component({
  selector: 'app-reservation-calendar',
  standalone: true,
  imports: [CalendarModule],
  templateUrl: './reservation-calendar.component.html',
  styleUrls: ['./reservation-calendar.component.scss'],
})
export class ReservationCalendar implements OnInit {
  constructor(
    private dialogRefSelf: MatDialogRef<ReservationCalendar>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { facility: Facility, reservations: ResReservation[] }
  ) {
  }

  // 顯示週視圖
  view: CalendarView = CalendarView.Week;
  // 當前日期
  viewDate: Date = new Date();

  openTime: number = 0;
  closeTime: number = 24;

  // 這是行事曆的核心：事件陣列
  events: CalendarEvent[] = [];

  ngOnInit(): void {
    this.openTime = Number(this.data.facility.openTime.split(':')[0]);
    this.closeTime = Number(this.data.facility.closeTime.split(':')[0]) - 1;
    let resTime = this.sortReservations(this.data.reservations);

    const eventColors = {
      available: { primary: '#1e90ff', secondary: '#D1E8FF' },  // 藍色：開放預約
      warning: { primary: '#e3bc08', secondary: '#FDF1BA' },    // 黃色：即將額滿
      full: { primary: '#ad2121', secondary: '#FAE3E3' }        // 紅色：已額滿
    };

    this.events = resTime.map((reservation): CalendarEvent => {
      let full = reservation.attendees >= this.data.facility.capacity;
      return {
        start: addHours(startOfDay(new Date(reservation.date)), Number(reservation.startTime.split(':')[0])),
        end: addHours(startOfDay(new Date(reservation.date)), Number(reservation.endTime.split(':')[0])),
        title: full ? '已額滿' : `尚有${this.data.facility.capacity - reservation.attendees}位空位`,
        color: full ? eventColors.full : reservation.attendees >= this.data.facility.capacity / 2 ? eventColors.warning : eventColors.available,
        meta: {
          data: {
            ...reservation,
            attendees: this.data.facility.capacity - reservation.attendees
          },
          full: full
        } // 你可以自定義額外資訊
      }
    })
  }

  // 當使用者點擊時間格子時觸發
  hourSegmentClicked(time: Date) {
    const hour = time.getHours();
    if (hour >= Number(this.data.facility.closeTime.split(':')[0]) || hour < Number(this.data.facility.openTime.split(':')[0]) || time < new Date()) {
      console.log('NO');
      // 你可以在這裡跳出 MatDialog 進行預約
    } else {
      const dialogRef = this.dialog.open(ReserveFacilityComponent, {
        data: { facility: this.data.facility, time: time },
      });
      dialogRef.afterClosed().pipe(takeUntil(this.dialogRefSelf.afterClosed())).subscribe({
        next: res => {
          if (res) {
            this.dialogRefSelf.close(true);
          }
        },
        error: err => {
          this.snackBar.open(err.error.message, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          console.log(err.error.message);
        }
      })
    }
  }

  onEventClick(event: CalendarEvent) {

    const hour = event.start.getHours();
    const time = event.start;

    if (hour >= Number(this.data.facility.closeTime.split(':')[0]) || hour < Number(this.data.facility.openTime.split(':')[0]) || time < new Date()) {
      console.log('NO');
    } else {
      if (this.events.some(event => event.start.getTime() === time.getTime() && event.meta.full)) {
        this.snackBar.open('這個時段已經額滿了喔', '關閉', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        })
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
              this.dialogRefSelf.close(true);
            }
          },
          error: err => {
            this.snackBar.open(err.error.message, '關閉', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            console.log(err.error.message);
          }
        })
      }
    }
  }

  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach((column) => {
      column.hours.forEach((hour) => {
        // 如果時間已經過了，就幫它加上一個叫 'cal-disabled' 的標籤
        if (hour.segments[0].date < new Date()) {
          hour.segments[0].cssClass = 'cal-disabled';
        }
      });
    });
  }

  changeWeek(i: number) {
    if (i === 1) {
      this.viewDate = addHours(this.viewDate, 7 * 24);
    } else if (i === -1) {
      this.viewDate = addHours(this.viewDate, -7 * 24);
    } else if (i === 0) {
      this.viewDate = new Date();
    } else {
      this.snackBar.open('亂輸入啥毛毛呢', '關閉', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      })
    }
  }

  sortReservations(resvation: ResReservation[]): Re[] {
    console.log(resvation);
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
