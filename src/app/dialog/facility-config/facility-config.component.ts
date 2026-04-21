import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpService } from '../../@service/http.service';
import { FormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-facility-config',
  standalone: true,
  imports: [FormsModule, MatIconModule, CommonModule],
  templateUrl: './facility-config.component.html',
  styleUrl: './facility-config.component.scss',
})
export class FacilityConfigComponent {

  constructor(
    private http: HttpService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<FacilityConfigComponent>,
  ) { }

  putUrl = "/reservation/remindTime";
  remindTime: string = '';

  hoursList: string[] = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, '0')}:00`
  );

  updateRemindTime() {
    if (this.remindTime) {
      this.http.putApi(this.putUrl, { timecron: this.remindTime }).subscribe({
        next: (res) => {
          console.log('提醒時間更新成功:', res);
          this.snackBar.open(('提醒時間已設定為' + this.remindTime), '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('提醒時間更新失敗:', err);
          this.snackBar.open('更新失敗', '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
      });
    } else {
      this.snackBar.open('請選擇提醒時間', '關閉', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });
    }
  }
}
