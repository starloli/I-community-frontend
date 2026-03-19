import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Facility, Reservation } from '../../interface/interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-reserve-facility',
  standalone: true,
  imports: [FormsModule, MatIcon],
  templateUrl: './reserve-facility.component.html',
  styleUrl: './reserve-facility.component.scss'
})
export class ReserveFacilityComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ReserveFacilityComponent>,
    @Inject(MAT_DIALOG_DATA) public facility: Facility
  ) { }
  reservation: Reservation[] = [];

  ngOnInit(): void {

  }

  // 關閉預約表單
  closeReserveForm() {
  }

  // ===== 送出預約 =====
  // TODO: 之後改成呼叫 POST /api/v1/reservations 送出預約
  submitReservation() {
    if (!this.reservation[0].date || !this.reservation[0].startTime || !this.reservation[0].endTime) {
      return;
    }
    console.log('預約資料：', {
      facilityId: this.facility?.id,
      ...this.reservation[0]
    });
    alert(`已成功預約 ${this.facility.name}!`);
    this.closeReserveForm();
  }
}
