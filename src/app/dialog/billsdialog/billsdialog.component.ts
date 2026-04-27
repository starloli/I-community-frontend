import { ChangeDetectorRef, Component } from '@angular/core';
import { VisitorServiceService } from '../../@service/visitor-service.service';

import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HttpService } from '../../@service/http.service';
@Component({
  selector: 'app-billsdialog',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './billsdialog.component.html',
  styleUrl: './billsdialog.component.scss'
})
export class BillsdialogComponent {
  constructor(private service: VisitorServiceService, private http: HttpService, private cdRef: ChangeDetectorRef, private dialogRef: MatDialogRef<BillsdialogComponent>

  ) { }
  bill!: any;
  dialogType!: string;
  ngOnInit(): void {


    const rawBill = this.service.myBillId;
    this.dialogType = this.service.booleanOpenDialog;
    if (rawBill) {
      // 2. 在賦值前先處理好顯示文字（或者拷貝一份處理）
      this.bill = { ...rawBill };

      if (this.bill.status === 'UNPAID') {
        this.bill.status = '待繳';
      } else if (this.bill.status === 'PAID') {
        this.bill.status = '已繳';
      } else if (this.bill.status === 'OVERDUE') {
        this.bill.status = '逾期';
      }
    }

    // 3. 讓 Angular 在下一輪週期自動更新，不需要手動 detectChanges
    console.log(this.bill);
  }

  cancel() {
    this.dialogType = "";
    this.service.booleanOpenDialog = "";
    this.dialogRef.close();
  }


  userPay(id: number) {
    this.http.putApi("/bills/pay/admin/" + id).subscribe((res: any) => {
      console.log(res);
      this.dialogType = "";
      this.service.booleanOpenDialog = "";
      this.dialogRef.close('refresh');
    })
  }
}
