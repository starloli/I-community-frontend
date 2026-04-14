import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BillStatus, BillType } from '../../../interface/enum';
import { AuthService } from '../../../@service/auth.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VisitorServiceService } from '../../../@service/visitor-service.service';
import { BillsdialogComponent } from '../../../dialog/billsdialog/billsdialog.component';

import { MatButtonModule } from '@angular/material/button';
import { SendBill } from '../../../dialog/send-bill/send-bill';
import { HttpService } from '../../../@service/http.service';
import { UserResponse } from '../../../interface/interface';
import { Subject, takeUntil } from 'rxjs';



@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [MatIconModule, CommonModule, MatDialogModule, CommonModule, FormsModule, MatPaginatorModule, MatButtonModule,],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.scss'
})
export class BillComponent implements OnInit, OnDestroy {
  constructor(private http: HttpService, private service: VisitorServiceService, private auth: AuthService) { }

  adminBills: any[] = [];
  readonly dialog = inject(MatDialog);

  private $destroy = new Subject<void>();

  openDialog() {
    const ref = this.dialog.open(BillsdialogComponent, {
      width: '500px',
      disableClose: false // 點擊背景是否可以關閉
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        console.log('收到刷新指令，重新獲取數據...');
        this.getAllBills();
      }
    });
  }

  openSendAllBillsDialog() {
    const ref = this.dialog.open(SendBill, {
      width: '500px',
      disableClose: false // 點擊背景是否可以關閉
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        console.log('收到刷新指令，重新獲取數據...');
        this.getAllBills();
      }
    });
  }

  // ── 住戶帳單篩選 ──────────────────────────────────────
  selectedFilter: '全部' | '待繳' | '已繳' | '逾期' = '全部';

  // ── 管理員繳費歷史篩選 ────────────────────────────────
  adminSelectedStatus: string = '';
  adminSelectedType: string = '';
  adminSelectedMonth: string = '';
  adminSearchKeyword: string = '';
  adminCurrentPage: number = 1;
  adminPageSize: number = 8;


  statusOptions = [
    { value: '', label: '全部狀態' },
    { value: 'UNPAID', label: '待繳' },
    { value: 'PAID', label: '已繳' },
    { value: 'OVERDUE', label: '逾期' },
  ];



  ngOnInit(): void {
    this.getAllBills();
  }

  getAllBills() {
    this.http.getApi("/bills/getAllBills").subscribe((res: any) => {
      this.adminBills = res;

      console.log(res);

    })
  }

  billsDialog(bill: any) {
    this.service.myBillId = bill;
    this.service.booleanOpenDialog = '';
    this.openDialog();
  }

  get filteredAdminBills(): any[] {
    let list = [...this.adminBills];

    if (this.adminSearchKeyword.trim()) {
      const kw = this.adminSearchKeyword.trim().toLowerCase();
      list = list.filter(b =>
        (b.billingMonth?.includes(kw) || false) || // 使用 ?. 和 || false
        (b.unitNumber?.toLowerCase().includes(kw) || false)
      );
    }

    if (this.adminSelectedStatus) list = list.filter(b => b.status === this.adminSelectedStatus);
    if (this.adminSelectedMonth) list = list.filter(b => b.billingMonth && b.billingMonth.substring(0, 10) === this.adminSelectedMonth.substring(0, 10));



    const statusPriority: { [key: string]: number } = {
      'UNPAID': 0,   // 未繳費最優先
      'OVERDUE': 1,  // 逾期第二
      'PAID': 2      // 已繳費最後
    };

    list.sort((a, b) => {
      // 1. 先按狀態權重排序
      const priorityA = statusPriority[a.status] ?? 99; // 若有未知狀態放最後
      const priorityB = statusPriority[b.status] ?? 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // 2. 如果狀態相同，再按日期排序 (可選：讓最新的日期在該狀態內排前面)
      return b.billingMonth.localeCompare(a.billingMonth);
    });

    return list;
  }

  get adminTotalPages(): number {
    return Math.ceil(this.filteredAdminBills.length / this.adminPageSize);
  }

  get pagedAdminBills(): any[] {
    const start = (this.adminCurrentPage - 1) * this.adminPageSize;
    return this.filteredAdminBills.slice(start, start + this.adminPageSize);
  }

  get adminPageNumbers(): number[] {
    return Array.from({ length: this.adminTotalPages }, (_, i) => i + 1);
  }
  //計算應收總額 (畫面上所有帳單的加總)
  get adminTotalAmount(): number {
    return this.filteredAdminBills.reduce((sum, b) => sum + b.totalAmount, 0);
  }
  //// 2. 計算「已收金額」(實拿到的錢)
  get adminPaidAmount(): number {
    return this.filteredAdminBills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + b.totalAmount, 0);
  }
  //未繳費的人數
  get adminUnpaidCount(): number {
    return this.filteredAdminBills.filter(b => b.status === 'UNPAID').length;
  }
  //逾期的人數
  get adminOverdueCount(): number {
    return this.filteredAdminBills.filter(b => b.status === 'OVERDUE').length;
  }

  get uniqueMonths(): string[] {
    return [...new Set(this.adminBills.map(b => b.billingMonth))].sort().reverse();
  }

  getUnqualifiedResidents(): string[] {
    let unqualifiedResidents: string[] = [];
    this.http.getApi<UserResponse[]>("/modify/getUnqualifiedResidents").pipe(takeUntil(this.$destroy)).subscribe({
      next: (res) => {
        unqualifiedResidents = res.map(r => r.unitNumber);
        console.log(unqualifiedResidents);
      },
      error: (err) => {
        console.log(err);
      }
    });
    return unqualifiedResidents;
  }

  onAdminFilterChange(): void { this.adminCurrentPage = 1; }

  goToAdminPage(page: number): void {
    if (page >= 1 && page <= this.adminTotalPages) this.adminCurrentPage = page;
  }



  formatAmount(amount: number): string {
    return `NT$ ${amount.toLocaleString()}`;
  }

  //用戶綫下付款
  userCashPay(bill: any) {
    this.service.myBillId = bill;
    this.service.booleanOpenDialog = "userCashPay";

    this.openDialog();

  }


  //發送賬單給全部住戶
  sendBills() {
    this.openSendAllBillsDialog();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}













