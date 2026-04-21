import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';
import { BillsdialogComponent } from '../billsdialog/billsdialog.component';
import { Router, RouterLink } from "@angular/router";
import { HttpService } from '../../@service/http.service';

@Component({
  selector: 'app-send-bill',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './send-bill.component.html',
  styleUrl: './send-bill.component.scss',
})
export class SendBillComponent {

  constructor(private http: HttpService, private dialogRef: MatDialogRef<SendBillComponent>, private router: Router) { }
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


  AbnormalUnits: any[] = [];

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


  //先看是不是有異常的住戶,有的話就不給發送賬單
  // searchAbnormalUnits(){



  //   this.http.getApi("/bills/getAbnormalUnits").subscribe((res:any)=>{

  //     this.AbnormalUnits = res;
  //        console.log(this.AbnormalUnits);
  //        if(this.AbnormalUnits.length > 0){
  //   this.page=3;}
  //   else{
  //       this.sendBillToUnit()
  //     }
  //       }
  //   )
  // }

  closeThisDialog() {
    this.dialogRef.close('refresh');
  }


  //先找本月是否有賬單了,如果有跳轉到第四頁, 如果沒有 去找有沒有異常住戶 , 沒有的話跳轉就發送成功
  searchAbnormalUnits() {
    const fullUrl = `/bills/findByMonth?billingMonth=${this.billingMonth}-01`;
    this.http.getApi(fullUrl).subscribe((ans: any) => {
      console.log("後端檢查結果：", ans);
      if (ans.message === '本月已經有賬單了') {
        this.page = 4;
        return;
      }
      else if (ans.message === '本月還沒有賬單') {
        this.http.getApi("/bills/getAbnormalUnits").subscribe((res: any) => {
          this.AbnormalUnits = res;
          console.log(this.AbnormalUnits);
          if (this.AbnormalUnits.length > 0) {
            this.page = 3; return;
          }
          this.sendBillToUnit()
        }
        )
      }

    }

    );
  }



  routerModifyResident() {
    this.router.navigate(['/admin/ModifyResident']);
    this.dialogRef.close('refresh');
  }
}

