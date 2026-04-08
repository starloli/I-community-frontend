import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Facility, Res, Reservation, User } from '../../interface/interface';
import { ReservationStatus } from '../../interface/enum';
import { provideNativeDateAdapter, MatOption } from '@angular/material/core';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../@service/http.service';
import { addHours, format } from 'date-fns';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-reserve-facility',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatTimepickerModule, ReactiveFormsModule, MatOption, MatSelectModule],
  templateUrl: './reserve-facility.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './reserve-facility.component.scss'
})
export class ReserveFacilityComponent implements OnInit, OnDestroy {

  constructor(
    private dialogRef: MatDialogRef<ReserveFacilityComponent>,
    private http: HttpService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { facility: Facility, time: Date },
  ) { }

  private destroy$ = new Subject<void>();

  postUrl = 'http://localhost:8083/user/reserve';
  getUrl = 'http://localhost:8083/user/me';
  reservation: Reservation = {
    reservationId: 0,
    userId: 0,
    facilityId: 0,
    date: '',
    startTime: '',
    endTime: '',
    attendees: 0,
  };
  endTime = '';
  attendeesControl = new FormControl<number | null>(1, [
    Validators.required
  ]);

  ngOnInit(): void {
    this.http.getApi<User>(this.getUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.reservation = {
            reservationId: 0,
            facilityId: this.data.facility.facilityId,
            userId: res.userId || 0,
            date: format(this.data.time, 'yyyy-MM-dd'),
            startTime: format(this.data.time, 'HH:mm:ss'),
            endTime: format(addHours(this.data.time, 1), 'HH:mm:ss'),
            attendees: 1,
          };
        },
        error: err => {
          this.snackBar.open(err.error.message, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          })
          console.log(err.error.message);
        }
      });
  }

  closeReserveForm() {
    this.dialogRef.close(false);
  }

  submitReservation() {
    this.reservation = {
      ...this.reservation,
      status: ReservationStatus.CONFIRMING,
      attendees: this.attendeesControl.value || 1
    };
    this.snackBar.open('正在提交預約...', '關閉', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
    console.log('res:', this.reservation);
    this.http.postApi<Res>(this.postUrl, this.reservation)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: res => {
          this.dialogRef.close(true);
        },
        error: err => {
          this.snackBar.open(err.error.message, '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          })
          console.log(err.error.message);
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get capacity(): number[] {
    const MaxCapacity = this.data.facility.capacity;
    return Array.from({ length: MaxCapacity }, (_, i) => i + 1)
  }
}
