import { Component, Inject, OnInit } from '@angular/core';
import { Facility } from '../../interface/interface';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpService } from '../../@service/http.service';
import { ToastService } from '../../@service/toast.service';

@Component({
  selector: 'app-update-facility',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './update-facility.component.html',
  styleUrl: './update-facility.component.scss',
})
export class UpdateFacilityComponent implements OnInit {

  hoursList: string[] = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, '0')}:00`
  );
  constructor(
    private http: HttpService,
    private toast: ToastService,
    public dialogRef: MatDialogRef<UpdateFacilityComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Facility
  ) { }

  putUrl = "/facility/update-facility";
  facility: Facility = {
    facilityId: 0,
    name: '',
    description: '',
    capacity: 0,
    openTime: '',
    closeTime: '',
    isReservable: false,
    isAvailable: false,
  };

  ngOnInit(): void {
    if (this.data)
      this.facility = {
        ...this.data,
        openTime: this.data.openTime.slice(0, 5),
        closeTime: this.data.closeTime.slice(0, 5)
      };
    console.log(this.facility);
  }

  getAvailableOpenTimes(): string[] {
    return this.hoursList.filter(hour => hour < '23:00');
  }

  getAvailableCloseTimes(): string[] {
    if (!this.facility.openTime) return this.hoursList;
    return this.hoursList.filter(hour => hour > this.facility.openTime);
  }

  onOpenTimeChange() {
    if (this.facility.openTime >= this.facility.closeTime) {
      const hour = this.facility.openTime.split(':')[0];
      const nextHour = (parseInt(hour) + 1).toString().padStart(2, '0');
      this.facility.closeTime = nextHour + ':00';

      if (parseInt(hour) >= 23)
        this.facility.closeTime = '';
    }
  }

  check() {
    if (this.facility.name == '' || this.facility.description == '' || this.facility.capacity == 0 || this.facility.openTime == '' || this.facility.closeTime == '') {
      this.toast.warning('請輸入完整資訊', 2000);
    } else {
      this.facility.closeTime = this.facility.closeTime + ':00';
      this.facility.openTime = this.facility.openTime + ':00';
      this.putUrl = `${this.putUrl}/${this.facility.facilityId}`;
      this.http.putApi(this.putUrl, this.facility).subscribe({
        next: res => {
          this.toast.success('設備更新成功', 2000);
          this.dialogRef.close(true);
        },
        error: err => {
          console.log(err);
          this.toast.error('設備更新失敗，錯誤代碼：' + err.status, 2000);
        }
      })
    }
  }
}
