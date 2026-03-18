import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Bill } from '../../interface/interface';


@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.scss'
})
export class BillComponent {

  // ===== 目前選擇的篩選狀態 =====
  selectedFilter: '全部' | '待繳' | '已繳' | '逾期' = '全部';

  // ===== 帳單假資料 =====
  // TODO: 之後改成呼叫 GET /api/v1/bills 取得真實資料
  bills: Bill[] = [
    { id: 1, billingMonth: '2026-03', billType: '水費',  amount: 350,  dueDate: '2026-03-31', status: '待繳', paidAt: '' },
    { id: 2, billingMonth: '2026-03', billType: '電費',  amount: 1200, dueDate: '2026-03-31', status: '待繳', paidAt: '' },
    { id: 3, billingMonth: '2026-03', billType: '管理費', amount: 2000, dueDate: '2026-03-31', status: '逾期', paidAt: '' },
    { id: 4, billingMonth: '2026-02', billType: '水費',  amount: 320,  dueDate: '2026-02-28', status: '已繳', paidAt: '2026-02-15' },
    { id: 5, billingMonth: '2026-02', billType: '電費',  amount: 980,  dueDate: '2026-02-28', status: '已繳', paidAt: '2026-02-15' },
    { id: 6, billingMonth: '2026-02', billType: '管理費', amount: 2000, dueDate: '2026-02-28', status: '已繳', paidAt: '2026-02-10' },
  ];

  // ===== 根據篩選條件過濾帳單 =====
  get filteredBills(): Bill[] {
    if (this.selectedFilter === '全部') return this.bills;
    return this.bills.filter(b => b.status === this.selectedFilter);
  }

  // ===== 統計各狀態數量 =====
  get pendingCount(): number {
    return this.bills.filter(b => b.status === '待繳').length;
  }
  get paidCount(): number {
    return this.bills.filter(b => b.status === '已繳').length;
  }
  get overdueCount(): number {
    return this.bills.filter(b => b.status === '逾期').length;
  }

  // ===== 繳費功能 =====
  // TODO: 之後改成呼叫 POST /api/v1/bills/{id}/pay 送出繳費
  payBill(bill: Bill) {
    const now = new Date();
    bill.status = '已繳';
    bill.paidAt = now.toLocaleDateString('zh-TW');
  }

  // ===== 帳單類型對應 icon =====
  getBillIcon(type: string): string {
    switch (type) {
      case '水費': return 'water_drop';
      case '電費': return 'bolt';
      case '管理費': return 'apartment';
      default: return 'receipt';
    }
  }

  // ===== 帳單類型對應顏色 =====
  getBillColor(type: string): string {
    switch (type) {
      case '水費': return '#0288d1';
      case '電費': return '#f57c00';
      case '管理費': return '#388e3c';
      default: return '#888';
    }
  }
}
