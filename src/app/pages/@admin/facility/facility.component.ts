import { HttpService } from '../../../@service/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Facility } from '../../../interface/interface';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { RegistFacilityComponent } from '../../../dialog/regist-facility/regist-facility.component';
import { ReservationCalendar } from '../../../dialog/reservation-calendar/reservation-calendar';

@Component({
  selector: 'app-facility',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.scss'
})
export class FacilityComponent implements OnInit, OnDestroy{

  constructor(private http: HttpService, private snackBar: MatSnackBar, private dialogRef: MatDialog) { }

  private destroy$ = new Subject<void>();

  getUrl = "http://localhost:8083/user/facilities";
  facilities: Facility[] = [];

  ngOnInit() {
    this.getFacility();
  }

  registFacility() {
    const dialogRef = this.dialogRef.open(RegistFacilityComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getFacility();
      }
    });
  }

  // ===== 設施列表 =====
  getFacility() {
    this.facilities = [];
    this.http.getApi<Array<Facility>>(this.getUrl)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: res => {
        if (res) {
          for (let r of res) {
            this.facilities.push(r);
          }
          console.log(this.facilities);
        } else {
          console.log("no data");
        }
      },
      error: err => {
        this.snackBar.open('發生錯誤，錯誤代碼：' + err.status, '關閉', {
          duration: 2000,
        });
        console.log(err);
      }
    })
  }

  // ===== 目前選擇的設施 =====
  selectedFacility: Facility | null = null;

  // ===== 控制預約表單是否顯示 =====
  showReserveForm = false;

  // ===== 預約表單資料 =====
  reserveForm = {
    date: '',
    startTime: '',
    endTime: '',
    attendees: 1,
  };

  // ===== 設施對應 icon =====
  getFacilityIcon(name: string): string {
    if (name.includes('健身')) return 'fitness_center';
    if (name.includes('游泳')) return 'pool';
    if (name.includes('會議')) return 'meeting_room';
    if (name.includes('交誼')) return 'groups';
    if (name.includes('兒童')) return 'child_care';
    return 'apartment';
  }

  // 開啟預約表單
  openReserveForm(facility: Facility) {
    const deslogRef = this.dialogRef.open(ReservationCalendar, {
      data: facility
    });
  }

  // 關閉預約表單
  closeReserveForm() {
    this.selectedFacility = null;
    this.reserveForm = { date: '', startTime: '', endTime: '', attendees: 1 };
  }

  // ===== 送出預約 =====
  // TODO: 之後改成呼叫 POST /api/v1/reservations 送出預約
  submitReservation() {
    if (!this.reserveForm.date || !this.reserveForm.startTime || !this.reserveForm.endTime) {
      return;
    }
    console.log('預約資料：', {
      facilityId: this.selectedFacility?.facilityId,
      ...this.reserveForm
    });
    alert(`已成功預約 ${this.selectedFacility?.name}!`);
    this.closeReserveForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}



