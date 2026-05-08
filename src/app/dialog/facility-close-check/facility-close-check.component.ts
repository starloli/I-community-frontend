import { MatDialogRef } from '@angular/material/dialog';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-facility-close-check',
  imports: [MatIconModule],
  standalone: true,
  templateUrl: './facility-close-check.component.html',
  styleUrl: './facility-close-check.component.scss',
})
export class FacilityCloseCheckComponent {

  constructor(private MatDialogRef: MatDialogRef<FacilityCloseCheckComponent>) { }

  confirm() {
    this.MatDialogRef.close(true);
  }

  cancel() {
    this.MatDialogRef.close(false);
  }
}
