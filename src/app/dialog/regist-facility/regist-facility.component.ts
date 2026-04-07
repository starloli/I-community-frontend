import { Component } from '@angular/core';
import { Facility } from '../../interface/interface';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpService } from '../../@service/http.service';

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
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<RegistFacilityComponent>,
  ) { }

  postUrl = "http://localhost:8083/admin/regist-facility";
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
    console.log(this.facility.openTime);
    console.log(this.facility.closeTime);
  }

  check() {
    if (this.facility) {
      if (this.facility.name == '' || this.facility.description == '' || this.facility.capacity == 0 || this.facility.openTime == '' || this.facility.closeTime == '') {
        this.snackBar.open('請輸入完整資訊', '關閉', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      } else {
        this.facility.closeTime = this.facility.closeTime + ':00';
        this.facility.openTime = this.facility.openTime + ':00';
        console.log(this.facility);
        this.http.postApi<Facility>(this.postUrl, this.facility).subscribe({
          next: res => {
            console.log(res);
            this.snackBar.open('新增成功', '關閉', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.dialogRef.close(true);
          },
          error: err => {
            console.log(err);
            this.snackBar.open('發生錯誤，錯誤代碼：' + err.status, '關閉', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        })
      }
    }
  }
}
