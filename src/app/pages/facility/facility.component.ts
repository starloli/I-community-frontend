import { HttpService } from '../../@service/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { RegistFacilityComponent } from '../../dialog/regist-facility/regist-facility.component';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Facility } from '../../interface/interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-facility',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.scss'
})
export class FacilityComponent implements OnInit {

  constructor(private http: HttpService, private snackBar: MatSnackBar, private dialog: MatDialog) { }

  getUrl = "http://localhost:8083/auth/facilities";
  facilities: Facility[] = [];

  registFacility() {
    const dialogRef = this.dialog.open(RegistFacilityComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getFacility();
      }
    });
  }

  ngOnInit() {
    this.getFacility();
  }

  getFacility() {
    this.facilities = [];
    this.http.getApi<Array<Facility>>(this.getUrl).subscribe({
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

  // ===== 設施列表 =====
  // TODO: 資料從 GET /auth/facilities 取得

  // ===== 假資料（等後端好了再換成真實 API）=====
  mockFacilities: Facility[] = [
    { id: 1, name: '健身房', description: '提供各式健身器材', capacity: 20, openTime: '06:00', closeTime: '22:00', isAvailable: true },
    { id: 2, name: '游泳池', description: '25公尺標準游泳池', capacity: 30, openTime: '07:00', closeTime: '21:00', isAvailable: true },
    { id: 3, name: '會議室', description: '可容納20人的會議空間', capacity: 20, openTime: '08:00', closeTime: '20:00', isAvailable: false },
    { id: 4, name: '交誼廳', description: '社區居民休閒聚會空間', capacity: 50, openTime: '08:00', closeTime: '22:00', isAvailable: true },
    { id: 5, name: '兒童遊樂室', description: '安全的兒童遊樂空間', capacity: 15, openTime: '09:00', closeTime: '18:00', isAvailable: true },
  ];

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
    this.selectedFacility = facility;
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
      facilityId: this.selectedFacility?.id,
      ...this.reserveForm
    });
    alert(`已成功預約 ${this.selectedFacility?.name}！`);
    this.closeReserveForm();
  }
}



