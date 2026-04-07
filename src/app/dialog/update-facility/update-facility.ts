import { Component, Inject, OnInit } from '@angular/core';
import { Facility } from '../../interface/interface';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpService } from '../../@service/http.service';

@Component({
  selector: 'app-update-facility',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './update-facility.html',
  styleUrl: './update-facility.scss',
})
export class UpdateFacility implements OnInit {

  hoursList: string[] = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, '0')}:00`
  );
  constructor(
    private http: HttpService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<UpdateFacility>,
    @Inject(MAT_DIALOG_DATA) public data: Facility
  ) { }

  postUrl = "http://localhost:8083/admin/update-facility";
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
      this.facility = { ...this.data };
  }

  getAvailableOpenTimes(): string[] {
    return this.hoursList.filter(hour => hour < '23:00');
  }

  getAvailableCloseTimes(): string[] {
    if (!this.facility.openTime) return this.hoursList;
    return this.hoursList.filter(hour => hour > this.facility.openTime);
  }

  onOpenTimeChange() {
    throw new Error('Method not implemented.');
  }

  check() {
    throw new Error('Method not implemented.');
  }
}
