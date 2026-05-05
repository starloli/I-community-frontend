import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomToastComponent } from '../shared/components/custom-toast/custom-toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor(private snackBar: MatSnackBar) { }

  /**
   * 顯示成功通知
   * @param message 訊息內容
   * @param duration 持續時間 (毫秒)
   */
  success(message: string, duration: number = 3000) {
    this.snackBar.openFromComponent(CustomToastComponent, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['transparent-toast-container'],
      data: { message, type: 'success', icon: 'check_circle' }
    });
  }

  /**
   * 顯示錯誤通知
   * @param message 訊息內容
   * @param duration 持續時間 (毫秒)
   */
  error(message: string, duration: number = 3000) {
    this.snackBar.openFromComponent(CustomToastComponent, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['transparent-toast-container'],
      data: { message, type: 'error', icon: 'error' }
    });
  }

  /**
   * 顯示資訊通知
   * @param message 訊息內容
   * @param duration 持續時間 (毫秒)
   */
  info(message: string, duration: number = 3000) {
    this.snackBar.openFromComponent(CustomToastComponent, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['transparent-toast-container'],
      data: { message, type: 'info', icon: 'info' }
    });
  }

  /**
   * 顯示警告通知
   * @param message 訊息內容
   * @param duration 持續時間 (毫秒)
   */
  warning(message: string, duration: number = 3000) {
    this.snackBar.openFromComponent(CustomToastComponent, {
      duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['transparent-toast-container'],
      data: { message, type: 'warning', icon: 'warning' }
    });
  }
}
