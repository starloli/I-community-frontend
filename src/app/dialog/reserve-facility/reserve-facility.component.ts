import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Facility } from '../../interface/interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-reserve-facility',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reserve-facility.component.html',
  styleUrl: './reserve-facility.component.scss'
})
export class ReserveFacilityComponent {

  constructor(public dialogRef: MatDialogRef<ReserveFacilityComponent>,
    @Inject(MAT_DIALOG_DATA) public facility: Facility
  ) { }


}
