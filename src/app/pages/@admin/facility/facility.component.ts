import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../@service/http.service';
import { Facility } from '../../../interface/interface';
import { RegistFacilityComponent } from '../../../dialog/regist-facility/regist-facility.component';
import { UpdateFacility } from '../../../dialog/update-facility/update-facility.component';

@Component({
  selector: 'app-facility',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './facility.component.html',
  styleUrl: './facility.component.scss'
})
export class FacilityComponent implements OnInit, OnDestroy {

  readonly Math = Math;

  constructor(private http: HttpService, private snackBar: MatSnackBar, private dialogRef: MatDialog) { }

  private destroy$ = new Subject<void>();

  getUrl = "/user/facilities";
  facilities: Facility[] = [];
  searchKeyword = '';
  availabilityFilter: 'all' | 'available' | 'unavailable' = 'all';
  reservationFilter: 'all' | 'reservable' | 'non-reservable' = 'all';
  sortOption: 'open-time-asc' | 'open-time-desc' | 'capacity-desc' | 'capacity-asc' = 'open-time-asc';
  currentPage = 1;
  pageSize = 6;

  get filteredFacilities(): Facility[] {
    const keyword = this.searchKeyword.trim().toLowerCase();

    return [...this.facilities]
      .filter((facility) => {
        const description = facility.description ?? '';
        const matchesKeyword = !keyword ||
          facility.name.toLowerCase().includes(keyword) ||
          description.toLowerCase().includes(keyword);

        const matchesAvailability =
          this.availabilityFilter === 'all' ||
          (this.availabilityFilter === 'available' && facility.isAvailable) ||
          (this.availabilityFilter === 'unavailable' && !facility.isAvailable);

        const matchesReservation =
          this.reservationFilter === 'all' ||
          (this.reservationFilter === 'reservable' && facility.isReservable) ||
          (this.reservationFilter === 'non-reservable' && !facility.isReservable);

        return matchesKeyword && matchesAvailability && matchesReservation;
      })
      .sort((a, b) => this.compareFacilities(a, b));
  }

  get hasActiveFilters(): boolean {
    return !!this.searchKeyword.trim()
      || this.availabilityFilter !== 'all'
      || this.reservationFilter !== 'all'
      || this.sortOption !== 'open-time-asc';
  }

  get totalPagesArray(): number[] {
    const total = Math.ceil(this.filteredFacilities.length / this.pageSize);
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  get pagedFacilities(): Facility[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredFacilities.slice(startIndex, startIndex + this.pageSize);
  }

  ngOnInit() {
    this.getFacility();
  }

  clearFilters(): void {
    this.searchKeyword = '';
    this.availabilityFilter = 'all';
    this.reservationFilter = 'all';
    this.sortOption = 'open-time-asc';
    this.currentPage = 1;
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPagesArray.length) {
      return;
    }

    this.currentPage = page;
  }

  ensureValidCurrentPage(): void {
    if (this.totalPagesArray.length === 0) {
      this.currentPage = 1;
      return;
    }

    if (this.currentPage > this.totalPagesArray.length) {
      this.currentPage = this.totalPagesArray.length;
    }
  }

  registFacility() {
    const dialogRef = this.dialogRef.open(RegistFacilityComponent);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getFacility();
      }
    });
  }

  updateFacility(facility: Facility) {
    const dialogRef = this.dialogRef.open(UpdateFacility, {
      data: facility
    });
    dialogRef.afterClosed().subscribe({
      next: res => {
        if (res) {
          this.getFacility();
        }
      },
      error: err => {
        this.snackBar.open('發生錯誤，錯誤代碼：' + err.status, '關閉', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        console.log(err);
      }
    });
  }

  deleteFacility(facilityId: number) {
    if (confirm('確定要刪除這個設施嗎？\n此動作無法復原 且會刪除相關預約資料\n\n若要停用設施 請使用編輯功能')) {
      this.http.deleteApi("/admin/delete-facility", facilityId).pipe(takeUntil(this.destroy$)).subscribe({
        next: res => {
          this.snackBar.open('刪除成功', '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.getFacility();
        },
        error: err => {
          this.snackBar.open('發生錯誤，錯誤代碼：' + err.status, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          console.log(err);
        }
      });
    }
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
            this.ensureValidCurrentPage();
            // console.log(this.facilities);
          } else {
            console.log("no data");
          }
        },
        error: err => {
          this.snackBar.open('發生錯誤，錯誤代碼：' + err.status, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          console.log(err);
        }
      })
  }

  compareFacilities(a: Facility, b: Facility): number {
    switch (this.sortOption) {
      case 'capacity-desc':
        return b.capacity - a.capacity;
      case 'capacity-asc':
        return a.capacity - b.capacity;
      case 'open-time-asc':
        return this.timeToMinutes(a.openTime) - this.timeToMinutes(b.openTime);
      case 'open-time-desc':
        return this.timeToMinutes(b.openTime) - this.timeToMinutes(a.openTime);
      default:
        return this.timeToMinutes(a.openTime) - this.timeToMinutes(b.openTime);
    }
  }

  timeToMinutes(time: string): number {
    const [hours = '0', minutes = '0'] = time.split(':');
    return Number(hours) * 60 + Number(minutes);
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
    console.log(facility);

    // const deslogRef = this.dialogRef.open(ReservationCalendar, {
    //   data: facility
    // });
  }

  // 關閉預約表單
  closeReserveForm() {
    this.selectedFacility = null;
    this.reserveForm = { date: '', startTime: '', endTime: '', attendees: 1 };
  }

  // ===== 送出預約 =====
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


