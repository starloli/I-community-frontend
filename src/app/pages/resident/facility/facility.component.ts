import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { HttpService } from '../../../@service/http.service';
import { Facility, Reservation } from '../../../interface/interface';
import { ReservationStatus } from '../../../interface/enum';
import { ReserveFacilityComponent } from '../../../dialog/reserve-facility/reserve-facility.component';

@Component({
  selector: 'app-resident-facility',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.scss'
})
export class ResidentFacilityComponent implements OnInit {

  constructor(
    private http: HttpService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  // ── 設施列表 ──────────────────────────────────────
  facilities: Facility[] = [];

  // ── 我的預約記錄 ──────────────────────────────────
  // TODO: GET /reservations/my（帶 token）
  myReservations: any[] = [
    {
      id: 1,
      facilityName: '健身房',
      date: '2026-03-25',
      startTime: '08:00',
      endTime: '10:00',
      attendees: 2,
      status: ReservationStatus.CONFIRMED
    },
    {
      id: 2,
      facilityName: '游泳池',
      date: '2026-03-22',
      startTime: '14:00',
      endTime: '16:00',
      attendees: 1,
      status: ReservationStatus.CANCELLED
    },
  ];

  // ── 目前顯示的 tab ────────────────────────────────
  activeTab: 'facilities' | 'my-reservations' = 'facilities';

  ReservationStatus = ReservationStatus;

  ngOnInit() {
    this.getFacility();
  }

  getFacility() {
    this.http.getApi<Array<Facility>>('http://localhost:8083/auth/facilities').subscribe({
      next: res => {
        if (res) this.facilities = res;
      },
      error: err => {
        this.snackBar.open('載入設施失敗：' + err.status, '關閉', { duration: 2000 });
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
  openReserveForm(facility: Facility) {
    const dialogRef = this.dialog.open(ReserveFacilityComponent, {
      data: facility,
      width: '500px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // 預約成功，將新預約加到列表
        const newReservation = {
          id: Date.now(),
          facilityName: facility.name,
          date: result.date,
          startTime: result.startTime,
          endTime: result.endTime,
          attendees: result.attendees,
          status: result.status
        };
        this.myReservations.unshift(newReservation);
        this.activeTab = 'my-reservations';
      }
    });
  }

  // ── 取消預約 ──────────────────────────────────────
  openCancelConfirm(id: number) {
    // 使用確認 dialog
    if (confirm('確定要取消預約嗎？取消後無法復原，請確認操作。')) {
      const idx = this.myReservations.findIndex(r => r.id === id);
      if (idx !== -1) {
        this.myReservations[idx].status = ReservationStatus.CANCELLED;
        this.snackBar.open('已取消預約', '關閉', { duration: 2000 });
      }
    }
  }

  // ── 格式化日期 ────────────────────────────────────
  formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });
  }
}
