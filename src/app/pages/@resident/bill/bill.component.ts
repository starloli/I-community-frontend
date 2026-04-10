import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { VisitorServiceService } from '../../../@service/visitor-service.service';
import { ApiService } from '../../../@service/api.service';
import { BillsdialogComponent } from '../../../dialog/billsdialog/billsdialog.component';

@Component({
  selector: 'app-resident-bill',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatDialogModule, CommonModule, FormsModule, MatPaginatorModule,],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.scss'
})
export class BillComponent implements OnInit {
  constructor(private http: ApiService, private service: VisitorServiceService) { }
  readonly dialog = inject(MatDialog);

  openDialog() {
    const ref = this.dialog.open(BillsdialogComponent, {
      width: '500px',
      disableClose: false // 點擊背景是否可以關閉
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        console.log('收到刷新指令，重新獲取數據...');
      }
    });
  }
  bills: any[] = [];



  currentPage = 1;
  pageSize = 10; // 每頁顯示 5 筆，可自行調整

  selectedMonth: string = '';
  adminSelectedMonth: string = '';


  // 1. 計算總頁數
  get totalPages(): number {
    return Math.ceil(this.filteredBills.length / this.pageSize) || 1;
  }

  // 2. 真正顯示在畫面上的「當頁資料」
  // 注意：HTML 中的 @for 要改循環這個變數
  get pagedBills(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBills.slice(start, start + this.pageSize);
  }

  // 3. 生成頁碼陣列 [1, 2, 3...]
  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // 4. 跳頁方法
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // 5. 當切換「全部/待繳/已繳」篩選時，要把頁碼歸零
  // 修改原有的 selectedFilter 加上 setter 或監聽
  private _selectedFilter: '全部' | '待繳' | '已繳' | '逾期' = '全部';
  get selectedFilter() { return this._selectedFilter; }
  set selectedFilter(val: any) {
    this._selectedFilter = val;
    this.currentPage = 1; // 切換標籤時回到第一頁
  }

  // ===== 目前選擇的篩選狀態 =====
  // selectedFilter: '全部' | '待繳' | '已繳' | '逾期' = '全部';


  ngOnInit(): void {
    this.getMyBills();
    console.log(localStorage.getItem('token'));
  }
  //得到個人的賬單
  getMyBills() {
    this.http.getApi("/bills/getMyBill").subscribe((res: any) => {
      console.log(res);
      this.bills = res.reverse();

      this.bills = res.map((bill: any) => {
        const typeMap: any = {
          'WATER': '水費',
          'ELECTRICITY': '電費',
          'MANAGEMENTFEE': '管理費',
          'CAR_PARKINGCLEANINGFEE': '汽車車位清潔費',
          'LOCOMOTIVE_PARKINGCLEANINGFEE': '機車車位清潔費',
          'OTHEREXPENSES': '其他費用'
        }; bill.billType = typeMap[bill.billType] || '其他費用';
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
    return this.bills.filter((b: any) => b.status === this.selectedFilter);
  }

  // ===== 統計各狀態數量 =====
  get pendingCount(): number {
    return this.bills.filter((b: any) => b.status === '待繳').length;
  }
  get paidCount(): number {
    return this.bills.filter((b: any) => b.status === '已繳').length;
  }
  get overdueCount(): number {
    return this.bills.filter((b: any) => b.status === '逾期').length;
  }




  //使用者點擊繳費
  payBill(id: number) {
    this.http.putApi('/bills/pay/user/' + id).subscribe((res: any) => {
      console.log(res);
      this.getMyBills();

    })
  }

  //打開dialog 查看詳細
  billsDialog(bill: any) {
    this.service.myBillId = bill;
    this.service.booleanOpenDialog = '';
    this.openDialog();
  }
}
