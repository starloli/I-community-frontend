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

  constructor(private dialogRef: MatDialogRef<SendBillChooseComponent>) { }

  onOpenUnitNumber() {
    const ref = this.dialog.open(SendBillToUnitnumberComponent, {
      width: 'min(600px, 92vw)',
      maxHeight: '85vh',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    ref.afterClosed().subscribe(result => {
      if (result === 'refresh') {



        // 1. 先關閉自己
        this.dialogRef.close('refresh');
      }
    })
  };

  // 處理「發送月度賬單」按鈕
  onOpenMonthlyBill() {
    const ref = this.dialog.open(SendBillComponent, {
      width: 'min(600px, 92vw)',
      maxHeight: '85vh',
      disableClose: false,
      panelClass: 'custom-dialog-container'
    });

    ref.afterClosed().subscribe(result => {
      if (result === 'refresh') {



        // 1. 先關閉自己
        this.dialogRef.close('refresh');
      }
    })
  }

}
