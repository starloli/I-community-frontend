import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BillsdialogComponent } from '../billsdialog/billsdialog.component';
import { Subject } from 'rxjs';
import { HttpService } from '../../@service/http.service';
import { SendBillComponent } from '../send-bill/send-bill.component';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-send-bill-to-unitnumber',
  imports: [FormsModule, ReactiveFormsModule,CommonModule],
  templateUrl: './send-bill-to-unitnumber.component.html',
  styleUrl: './send-bill-to-unitnumber.component.scss',
})
export class SendBillToUnitnumberComponent {
  currentResidents: any[] = [];
  addressMap = new Map<string, any>();
  addressList: string[] = [];
  constructor(private http: HttpService, private dialogRef: MatDialogRef<SendBillComponent>, private router: Router) { }
  title!: string;
  billingMonth!: string;
  dueDate!: string;
  remark!: string;
  TOTAL_WATER: number=0;
  TOTAL_ELECTRICITY: number=0
  PING_PRICE: number=0
  CAR_SPACE_PRICE: number=0
  MOTO_SPACE_PRICE: number=0
  OTHERFEE!: number;
unitNumber!:string;


  page: number = 1;


  AbnormalUnits: any[] = [];

  ngOnInit(): void {
   console.log("打開的是SendBillComponent");
this.getAllAddresses();

  }

  sendBillToUnit() {
    let billData = {
      "unitNumber": this.unitNumber,
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

    this.http.postApi("/bills/chargeRepairFee", billData).subscribe((res: any) => {
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






  routerModifyResident() {
    this.router.navigate(['/admin/ModifyResident']);
    this.dialogRef.close('refresh');
}



  getAllAddresses() {
    this.http.getApi('/visitor/allAddresses').subscribe((res: any) => {
      this.addressList = Array.isArray(res) ? res.sort() : [];
    });
  }

  onAddressChange(address: string) {
    this.currentResidents = [];
this.unitNumber = address;
    if (!address) {
      return;
    }

    // 優先從緩存取得，避免重複查詢
    if (this.addressMap.has(address)) {
      this.currentResidents = this.addressMap.get(address);
      return;
    }

    // 向後端查詢該地址的住戶
    this.http.getApi(`/visitor/by-address?address=${encodeURIComponent(address)}`).subscribe((data: any) => {
      this.currentResidents = data;
      this.addressMap.set(address, data);
    });
  }
get isAddressValid(): boolean {
  // 檢查 unitNumber 是否在 addressList 陣列中
  return this.addressList.includes(this.unitNumber);
}
}
