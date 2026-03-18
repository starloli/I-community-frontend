import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Facility } from '../../interface/interface';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-facility',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.scss'
})
export class FacilityComponent implements OnInit {

  constructor(private http: ApiService) {}

  // ===== 設施列表 =====
  // TODO: 資料從 GET /auth/facilities 取得
  facilities: Facility[] = [];

  // ===== 假資料（等後端好了再換成真實 API）=====
  mockFacilities: Facility[] = [
    { id: 1, name: '健身房',   description: '提供各式健身器材',     capacity: 20, open_time: '06:00', close_time: '22:00', is_available: true },
    { id: 2, name: '游泳池',   description: '25公尺標準游泳池',     capacity: 30, open_time: '07:00', close_time: '21:00', is_available: true },
    { id: 3, name: '會議室',   description: '可容納20人的會議空間', capacity: 20, open_time: '08:00', close_time: '20:00', is_available: false },
    { id: 4, name: '交誼廳',   description: '社區居民休閒聚會空間', capacity: 50, open_time: '08:00', close_time: '22:00', is_available: true },
    { id: 5, name: '兒童遊樂室', description: '安全的兒童遊樂空間', capacity: 15, open_time: '09:00', close_time: '18:00', is_available: true },
  ];

 // ===== 控制預約表單是否顯示 =====
showReserveForm = false;

// ===== 目前選擇的設施 =====
selectedFacility: Facility | null = null;

// ===== 預約表單資料 =====
reserveForm = {
  date: '',
  startTime: '',
  endTime: '',
  attendees: 1,
};

  ngOnInit() {
    // TODO: 之後改成呼叫真實 API
    // this.getFacility();
    this.facilities = this.mockFacilities;
  }

  // ===== 取得設施列表 API =====
  // TODO: 之後取消註解，串接後端
  getFacility() {
    this.http.getApi('/auth/facilities').subscribe((res: any) => {
      if (res) {
        this.facilities = res;
      } else {
        console.log('no data');
      }
    });
  }

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
  this.showReserveForm = true;
}

// 關閉預約表單
closeReserveForm() {
  this.showReserveForm = false;
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



