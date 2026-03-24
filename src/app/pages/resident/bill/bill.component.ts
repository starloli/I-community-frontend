import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Bill } from '../../../interface/interface';
import { BillStatus, BillType } from '../../../interface/enum';

@Component({
  selector: 'app-resident-bill',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.scss'
})
export class BillComponent implements OnInit {

  // ── 篩選狀態 ──────────────────────────────────────────
  selectedFilter: '全部' | '待繳' | '已繳' | '逾期' = '全部';

  // ── 分頁設定 ──────────────────────────────────────────
  currentPage: number = 1;
  pageSize: number = 5;

  // ── 帳單假資料 ──────────────────────────────────────────
  // TODO: GET /bills/my（帶 token，只回傳自己的帳單）
  bills: Bill[] = [
    { id: 1, billingMonth: '2026-03', billType: BillType.WATER, amount: 350, dueDate: '2026-03-31', status: BillStatus.PAID, paidAt: '2026-03-20', paymentMethod: '', createdAt: '' },
    { id: 2, billingMonth: '2026-03', billType: BillType.ELECTRICITY, amount: 1200, dueDate: '2026-03-31', status: BillStatus.UNPAID, paidAt: '', paymentMethod: '', createdAt: '' },
    { id: 3, billingMonth: '2026-03', billType: BillType.MAINTENANCE, amount: 2000, dueDate: '2026-03-31', status: BillStatus.OVERDUE, paidAt: '', paymentMethod: '', createdAt: '' },
    { id: 4, billingMonth: '2026-02', billType: BillType.MANAGEMENT, amount: 320, dueDate: '2026-02-28', status: BillStatus.PAID, paidAt: '2026-02-15', paymentMethod: '', createdAt: '' },
    { id: 5, billingMonth: '2026-02', billType: BillType.WATER, amount: 980, dueDate: '2026-02-28', status: BillStatus.UNPAID, paidAt: '', paymentMethod: '', createdAt: '' },
    { id: 6, billingMonth: '2026-02', billType: BillType.ELECTRICITY, amount: 2000, dueDate: '2026-02-28', status: BillStatus.OVERDUE, paidAt: '', paymentMethod: '', createdAt: '' },
  ];

  constructor(private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    // TODO: 串接 API
    // this.apiService.getApi('/bills/my')
    //   .subscribe((res: any) => { this.bills = res.data; });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 帳單篩選和計算
  // ════════════════════════════════════════════════════════════════════════════
  get filteredBills(): Bill[] {
    if (this.selectedFilter === '全部') return this.bills;
    return this.bills.filter(b => b.status === this.selectedFilter);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredBills.length / this.pageSize);
  }

  get pagedBills(): Bill[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredBills.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get pendingCount(): number { return this.bills.filter(b => b.status === BillStatus.UNPAID).length; }
  get paidCount(): number { return this.bills.filter(b => b.status === BillStatus.PAID).length; }
  get overdueCount(): number { return this.bills.filter(b => b.status === BillStatus.OVERDUE).length; }

  // ════════════════════════════════════════════════════════════════════════════
  // 分頁操作
  // ════════════════════════════════════════════════════════════════════════════
  onFilterChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 繳費操作
  // ════════════════════════════════════════════════════════════════════════════
  payBill(bill: Bill) {
    // TODO: POST /bills/{id}/pay
    bill.status = BillStatus.PAID;
    bill.paidAt = new Date().toLocaleDateString('zh-TW');
    this.snackBar.open(`已為帳單 ${bill.billingMonth} 繳費 ${this.formatAmount(bill.amount)}`, '關閉', { duration: 3000 });
  }


  // ════════════════════════════════════════════════════════════════════════════
  // 共用工具函數
  // ════════════════════════════════════════════════════════════════════════════
  getBillIcon(type: string): string {
    switch (type) {
      case BillType.WATER: return 'water_drop';
      case BillType.ELECTRICITY: return 'bolt';
      case BillType.MANAGEMENT: return 'apartment';
      case BillType.MAINTENANCE: return 'build';
      default: return 'receipt';
    }
  }

  getBillColor(type: string): string {
    switch (type) {
      case BillType.WATER: return '#0288d1';
      case BillType.ELECTRICITY: return '#f57c00';
      case BillType.MANAGEMENT: return '#388e3c';
      case BillType.MAINTENANCE: return '#7b1fa2';
      default: return '#888';
    }
  }

  formatAmount(amount: number): string {
    return `NT$ ${amount.toLocaleString()}`;
  }
}
