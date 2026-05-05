import { Component } from '@angular/core';
import { Facility } from '../../interface/interface';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpService } from '../../@service/http.service';
import { ToastService } from '../../@service/toast.service';

@Component({
  selector: 'app-regist-facility',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './regist-facility.component.html',
  styleUrl: './regist-facility.component.scss'
})
export class RegistFacilityComponent {

  constructor(
    private http: HttpService,
    private toast: ToastService,
    public dialogRef: MatDialogRef<RegistFacilityComponent>,
  ) { }

  postUrl = "/facility/regist-facility";
  update = false;
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

  openTimeIndex: number = 0;
  hoursList: string[] = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, '0')}:00`
  );

  getAvailableOpenTimes(): string[] {
    return this.hoursList.filter(hour => hour < '23:00');
  }

  getAvailableCloseTimes(): string[] {
    if (!this.facility.openTime) return this.hoursList;
    return this.hoursList.filter(hour => hour > this.facility.openTime);
  }

  onOpenTimeChange() {
    if (this.facility.openTime && this.facility.closeTime) {
      if (this.facility.openTime >= this.facility.closeTime) {
        const hour = this.facility.openTime.split(':')[0];
        const nextHour = (parseInt(hour) + 1).toString().padStart(2, '0');
        this.facility.closeTime = nextHour + ':00';

        if (parseInt(hour) >= 23)
          this.facility.closeTime = '';
      }
    }
  }

  check() {
    if (this.facility.name == '' || this.facility.description == '' || this.facility.capacity == 0 || this.facility.openTime == '' || this.facility.closeTime == '') {
      this.toast.warning('請輸入完整資訊', 2000);
    } else {
      this.facility.closeTime = this.facility.closeTime + ':00';
      this.facility.openTime = this.facility.openTime + ':00';
      this.http.postApi<Facility>(this.postUrl, this.facility).subscribe({
        next: res => {
          this.toast.success('設備新增成功', 2000);
          this.dialogRef.close(true);
        },
        error: err => {
          console.log(err);
          this.toast.error('設備新增失敗，錯誤代碼：' + err.status, 2000);
        }
      })
    }
  }
}
