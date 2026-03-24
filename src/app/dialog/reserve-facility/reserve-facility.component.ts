import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Facility, Res, Reservation, User } from '../../interface/interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { ReservationStatus } from '../../interface/enum';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../@service/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-reserve-facility',
  standalone: true,
  imports: [FormsModule, MatIcon, MatFormFieldModule, MatInputModule, MatTimepickerModule, ReactiveFormsModule],
  templateUrl: './reserve-facility.component.html',
  providers: [provideNativeDateAdapter()],
  styleUrl: './reserve-facility.component.scss'
})
export class ReserveFacilityComponent implements OnInit, OnDestroy {

  constructor(
    private dialogRef: MatDialogRef<ReserveFacilityComponent>,
    private http: HttpService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public facility: Facility,
  ) { }

  private destroy$ = new Subject<void>();

  private readonly token = localStorage.getItem('token');

  postUrl = 'http://localhost:8083/user/reserve'
  getUrl = 'http://localhost:8083/user/me'
  reservation: Reservation = {
    facilityId: 0,
    date: '',
    startTime: '',
    endTime: '',
    attendees: 0,
  };
  now = new Date();
  minDay = '';
  today = '';
  startTimeControl = new FormControl<Date | null>(null);
  endTimeControl = new FormControl<Date | null>(null);
  minTime = new Date();
  maxTime = new Date();

  ngOnInit(): void {
    if (this.now.getMinutes() > 30) {
      this.now.setHours(this.now.getHours() + 1);
      this.now.setMinutes(0);
    } else if (this.now.getMinutes() >= 0) {
      this.now.setMinutes(30);
    };

    this.minTime = new Date(Math.max(this.now.getTime(), new Date(`${this.now.toISOString().split('T')[0]}T${this.facility.openTime}`).getTime()));
    this.maxTime = new Date(this.minTime.getTime() + 60 * 60 * 1000);
    if (this.now > new Date(`${this.now.toISOString().split('T')[0]}T${this.facility.closeTime}`)) {
      this.minDay = new Date(this.now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    } else {
      this.minDay = this.now.toISOString().split('T')[0];
    }

    if (this.facility.id) {
      this.reservation = {
        facilityId: this.facility.id,
        date: this.minDay,
        startTime: '',
        endTime: '',
        attendees: 1,
      }
    }

    this.startTimeControl.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(newStartTime => {
      if (newStartTime) {
        this.maxTime = new Date(newStartTime.getTime() + 30 * 60 * 1000);
        if (this.endTimeControl.value) {
          if (this.maxTime > this.endTimeControl.value) {
            this.endTimeControl.setValue(this.maxTime);
          }
        }
      }
    })
  }

  closeReserveForm() {
    this.dialogRef.close();
  }

  submitReservation() {
    this.reservation = {
      ...this.reservation,
      date: this.today,
      startTime: this.startTimeControl.value?.toISOString().split('T')[1] || 'start-time-rror',
      endTime: this.endTimeControl.value?.toISOString().split('T')[1] || 'end-time-rror',
      status: ReservationStatus.CONFIRMING,
    };
    console.log(this.reservation);
    this.http.getApi<User>(this.getUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          this.reservation.userId = res.userId;
          this.http.postApi<Res>(this.postUrl, this.reservation)
            .pipe(takeUntil(this.destroy$)).subscribe({
              next: res => {
                this.snackBar.open(res.message, '關閉', {
                  duration: 2000,
                })
                this.dialogRef.close();
              },
              error: err => {
                this.snackBar.open(err.error.message, '關閉', {
                  duration: 2000,
                })
                console.log(err.error.message);
              }
            })
        },
        error: err => {
          this.snackBar.open(err.error.message, '關閉', {
            duration: 2000,
          })
          console.log(err.error.message);
        }
      }
      )
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
