import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BillsdialogComponent } from '../billsdialog/billsdialog.component';
import { Subject } from 'rxjs';
import { SendBillToUnitnumberComponent } from '../send-bill-to-unitnumber/send-bill-to-unitnumber.component';
import { SendBillComponent } from '../send-bill/send-bill.component';


import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-send-bill-choose',
  imports: [MatIconModule],
  templateUrl: './send-bill-choose.component.html',
  styleUrl: './send-bill-choose.component.scss',
})
export class SendBillChooseComponent {
 readonly dialog = inject(MatDialog);

  private $destroy = new Subject<void>();

constructor(private dialogRef: MatDialogRef<SendBillChooseComponent>){}

onOpenUnitNumber() {
    // 1. 先關閉自己
    this.dialogRef.close();

    // 2. 開啟另一個 Dialog
setTimeout(() => {
    this.dialog.open(SendBillToUnitnumberComponent, {
      width: 'min(600px, 92vw)',
      maxHeight: '85vh',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });
  }, 200);
  }

  // 處理「發送月度賬單」按鈕
  onOpenMonthlyBill() {
    this.dialogRef.close();
   setTimeout(() => {
    this.dialog.open(SendBillComponent, {
      width: 'min(650px, 92vw)',
      maxHeight: '85vh',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });
  }, 200);
  }


  openDialog() {
    const ref = this.dialog.open(SendBillComponent, {
      width: 'min(760px, 92vw)',
      maxWidth: '92vw',
      maxHeight: '90vh',
      disableClose: false // 點擊背景是否可以關閉
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        console.log('收到刷新指令，重新獲取數據...');

      }
    });
  }
openDialogToUnitNumber(){
  const ref = this.dialog.open(SendBillToUnitnumberComponent, {
      width: '500px',
      disableClose: false // 點擊背景是否可以關閉
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        console.log('收到刷新指令，重新獲取數據...');

      }
    });
  }

}
