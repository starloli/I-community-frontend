import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { UserResponse } from '../../interface/interface';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-active-user',
  imports: [MatDialogModule, MatIconModule, CommonModule],
  standalone: true,
  templateUrl: './active-user.component.html',
  styleUrl: './active-user.component.scss',
})
export class ActiveUserComponent {
  constructor(
    private dialogRef: MatDialogRef<ActiveUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserResponse,
  ) { }

  onClose(close: boolean): void {
    if (close) {
      this.dialogRef.close(true);
    } else {
      this.dialogRef.close();
    }
  }
}
