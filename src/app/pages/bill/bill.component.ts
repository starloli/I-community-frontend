import { Component,inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Bill } from '../../interface/interface';
import { BillStatus, BillType } from '../../interface/enum';
import { RouterLink } from "@angular/router";
import { ApiService } from '../../services/api.service';
import { VisitorServiceService } from '../../@service/visitor-service.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BillsdialogComponent } from '../../dialog/billsdialog/billsdialog.component';


@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [MatIconModule, CommonModule, RouterLink,MatDialogModule,CommonModule,FormsModule, MatPaginatorModule, RouterLink,],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.scss'
})
export class BillComponent {


  constructor(private http:ApiService,private service:VisitorServiceService){}
  readonly dialog = inject(MatDialog);
 openDialog() {
    this.dialog.open(BillsdialogComponent);
  }
bills: any[] = [];





  // ===== 目前選擇的篩選狀態 =====
  selectedFilter: '全部' | '待繳' | '已繳' | '逾期' = '全部';


  ngOnInit(): void {
this.getMyBills();

  }
  //得到個人的賬單
  getMyBills(){
     this.http.getApi("/bills/getMyBill").subscribe((res:any)=>{
    console.log(res);
    this.bills=res.reverse();

    this.bills = res.map((bill: any) => {
      const typeMap: any = {
        'WATER': '水費',
        'ELECTRICITY': '電費',
        'MANAGEMENTFEE': '管理費',
        'CAR_PARKINGCLEANINGFEE': '汽車車位清潔費',
        'LOCOMOTIVE_PARKINGCLEANINGFEE': '機車車位清潔費',
        'OTHEREXPENSES': '其他費用'
      };bill.billType = typeMap[bill.billType] || '其他費用';
if (bill.status === 'UNPAID') {
        bill.status = '待繳';
      } else if (bill.status === 'PAID') {
        bill.status = '已繳';
      } else if (bill.status === 'OVERDUE') {
        bill.status = '逾期';
      }

      return bill;
    });
  });
}





  // ===== 根據篩選條件過濾帳單 =====
  get filteredBills(): any[] {
    if (!this.bills) return [];
    if (this.selectedFilter === '全部') return this.bills;
    return this.bills.filter((b:any) => b.status === this.selectedFilter);
  }

  // ===== 統計各狀態數量 =====
  get pendingCount(): number {
    return this.bills.filter((b:any) => b.status === '待繳').length;
  }
  get paidCount(): number {
    return this.bills.filter((b:any) => b.status === '已繳').length;
  }
  get overdueCount(): number {
    return this.bills.filter((b:any) => b.status === '逾期').length;
  }




  //使用者點擊繳費
payBill(id:number){
  this.http.putApi('/bills/pay/user/'+id).subscribe((res:any)=>{
    console.log(res);
    this.getMyBills();

  })
}

//打開dialog 查看詳細
billsDialog(bill :any){
this.service.myBillId=bill;
this.openDialog();
}
}
