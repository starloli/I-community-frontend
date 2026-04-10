import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from './../../@service/api.service';
import { Component } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';
import { BillsdialogComponent } from '../billsdialog/billsdialog.component';
@Component({
  selector: 'app-send-bill',
  imports: [FormsModule, ReactiveFormsModule,],
  templateUrl: './send-bill.html',
  styleUrl: './send-bill.scss',
})
export class SendBill {

  constructor(private http: ApiService, private dialogRef: MatDialogRef<SendBill>) { }
  title!: string;
  billingMonth!: string;
  dueDate!: string;
  remark!: string;
  TOTAL_WATER!: number;
  TOTAL_ELECTRICITY!: number;
  PING_PRICE!: number;
  CAR_SPACE_PRICE!: number;
  MOTO_SPACE_PRICE!: number;
  OTHERFEE!: number;



  page: number = 1;




  sendBillToUnit() {
    let billData = {
      "title": this.title,
      "billingMonth": this.billingMonth + "-01",
      "dueDate": this.dueDate,
      "remark": this.remark,
      commonFees: {
        "TOTAL_WATER": this.TOTAL_WATER,
        "TOTAL_ELECTRICITY": this.TOTAL_ELECTRICITY,
        "PING_PRICE": this.PING_PRICE,
        "CAR_SPACE_PRICE": this.CAR_SPACE_PRICE,
        "MOTO_SPACE_PRICE": this.MOTO_SPACE_PRICE,
        "OTHERFEE": this.OTHERFEE
      }
    }

    this.http.postApi("/bills/sendAllBills", billData).subscribe((res: any) => {
      console.log(res, "成功發送賬單");
      this.page = 1
      this.dialogRef.close('refresh');

    })
  }
  cancel() {
    this.dialogRef.close('refresh');
    this.page = 1;
  }


  //下一步
  next() {
    this.page++;
  }
  last() {
    this.page--;
  }

}
