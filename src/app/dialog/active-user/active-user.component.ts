import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserResponse } from '../../interface/interface';

@Component({
  selector: 'app-active-user',
  imports: [],
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
