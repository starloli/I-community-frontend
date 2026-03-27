import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bill } from '../../../interface/interface';
import { BillStatus, BillType } from '../../../interface/enum';
import { AuthService } from '../../../@service/auth.service';

// ── 管理員繳費歷史用的型別（含住戶資訊）──────────────
interface AdminBillRecord {
  id: number;
  userFullName: string;
  unitNumber: string;
  billType: BillType;
  amount: number;
  billingMonth: string;
  dueDate: string;
  status: BillStatus;
  paidAt: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule],
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.scss'
})
export class BillComponent implements OnInit {

  isAdmin = false;

  // ── 住戶帳單篩選 ──────────────────────────────────────
  selectedFilter: '全部' | '待繳' | '已繳' | '逾期' = '全部';

  // ── 管理員繳費歷史篩選 ────────────────────────────────
  adminSelectedStatus: string = '';
  adminSelectedType: string = '';
  adminSelectedMonth: string = '';
  adminSearchKeyword: string = '';
  adminCurrentPage: number = 1;
  adminPageSize: number = 5;

  // ── 管理員篩選選項（只有社區費用）────────────────────
  communityBillTypes = [
    { value: '',                        label: '全部類型' },
    { value: BillType.MANAGEMENT,       label: '管理費' },
    { value: BillType.MAINTENANCE,      label: '維修費' },
    { value: BillType.OTHER,            label: '其他' },
  ];

  statusOptions = [
    { value: '',                  label: '全部狀態' },
    { value: BillStatus.UNPAID,   label: '待繳' },
    { value: BillStatus.PAID,     label: '已繳' },
    { value: BillStatus.OVERDUE,  label: '逾期' },
  ];

  // ── 住戶帳單假資料 ────────────────────────────────────
  // TODO: GET /bills/my（帶 token，只回傳自己的帳單）
  bills: Bill[] = [
    { id: 1, billingMonth: '2026-03', billType: BillType.WATER,       amount: 350,  dueDate: '2026-03-31', status: BillStatus.PAID,    paidAt: '', paymentMethod: '', createdAt: '' },
    { id: 2, billingMonth: '2026-03', billType: BillType.ELECTRICITY, amount: 1200, dueDate: '2026-03-31', status: BillStatus.UNPAID,  paidAt: '', paymentMethod: '', createdAt: '' },
    { id: 3, billingMonth: '2026-03', billType: BillType.MAINTENANCE, amount: 2000, dueDate: '2026-03-31', status: BillStatus.OVERDUE, paidAt: '', paymentMethod: '', createdAt: '' },
    { id: 4, billingMonth: '2026-02', billType: BillType.MANAGEMENT,  amount: 320,  dueDate: '2026-02-28', status: BillStatus.PAID,    paidAt: '2026-02-15', paymentMethod: '', createdAt: '' },
    { id: 5, billingMonth: '2026-02', billType: BillType.WATER,       amount: 980,  dueDate: '2026-02-28', status: BillStatus.UNPAID,  paidAt: '2026-02-15', paymentMethod: '', createdAt: '' },
    { id: 6, billingMonth: '2026-02', billType: BillType.ELECTRICITY, amount: 2000, dueDate: '2026-02-28', status: BillStatus.OVERDUE, paidAt: '2026-02-10', paymentMethod: '', createdAt: '' },
  ];

  // ── 管理員社區費用假資料 ──────────────────────────────
  // TODO: GET /admin/bills?type=MANAGEMENT,MAINTENANCE,OTHER
  adminBills: AdminBillRecord[] = [
    { id: 1,  userFullName: '林家宇', unitNumber: 'A-1201', billType: BillType.MANAGEMENT,  amount: 2500, billingMonth: '2026-03', dueDate: '2026-03-31', status: BillStatus.PAID,    paidAt: '2026-03-15', paymentMethod: '網路繳費' },
    { id: 2,  userFullName: '王志明', unitNumber: 'A-0805', billType: BillType.MANAGEMENT,  amount: 2500, billingMonth: '2026-03', dueDate: '2026-03-31', status: BillStatus.UNPAID,  paidAt: '',           paymentMethod: '' },
    { id: 3,  userFullName: '陳美玲', unitNumber: 'B-0302', billType: BillType.MAINTENANCE, amount: 1200, billingMonth: '2026-03', dueDate: '2026-03-31', status: BillStatus.PAID,    paidAt: '2026-03-10', paymentMethod: '現金' },
    { id: 4,  userFullName: '李大偉', unitNumber: 'C-1501', billType: BillType.MANAGEMENT,  amount: 2500, billingMonth: '2026-02', dueDate: '2026-02-28', status: BillStatus.OVERDUE, paidAt: '',           paymentMethod: '' },
    { id: 5,  userFullName: '張小芳', unitNumber: 'B-0910', billType: BillType.MANAGEMENT,  amount: 2500, billingMonth: '2026-02', dueDate: '2026-02-28', status: BillStatus.PAID,    paidAt: '2026-02-20', paymentMethod: '網路繳費' },
    { id: 6,  userFullName: '黃建國', unitNumber: 'A-0401', billType: BillType.MAINTENANCE, amount: 800,  billingMonth: '2026-02', dueDate: '2026-02-28', status: BillStatus.OVERDUE, paidAt: '',           paymentMethod: '' },
    { id: 7,  userFullName: '吳淑惠', unitNumber: 'C-0705', billType: BillType.OTHER,       amount: 500,  billingMonth: '2026-01', dueDate: '2026-01-31', status: BillStatus.PAID,    paidAt: '2026-01-25', paymentMethod: '現金' },
    { id: 8,  userFullName: '林家宇', unitNumber: 'A-1201', billType: BillType.MANAGEMENT,  amount: 2500, billingMonth: '2026-02', dueDate: '2026-02-28', status: BillStatus.PAID,    paidAt: '2026-02-18', paymentMethod: '網路繳費' },
    { id: 9,  userFullName: '王志明', unitNumber: 'A-0805', billType: BillType.MAINTENANCE, amount: 600,  billingMonth: '2026-01', dueDate: '2026-01-31', status: BillStatus.PAID,    paidAt: '2026-01-20', paymentMethod: '現金' },
    { id: 10, userFullName: '陳美玲', unitNumber: 'B-0302', billType: BillType.MANAGEMENT,  amount: 2500, billingMonth: '2026-01', dueDate: '2026-01-31', status: BillStatus.OVERDUE, paidAt: '',           paymentMethod: '' },
  ];

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.isAdmin();
    // TODO: 串接 API
    // if (this.isAdmin) {
    //   this.apiService.getApi('/admin/bills?type=MANAGEMENT,MAINTENANCE,OTHER')
    //     .subscribe((res: any) => { this.adminBills = res.data; });
    // } else {
    //   this.apiService.getApi('/bills/my')
    //     .subscribe((res: any) => { this.bills = res.data; });
    // }
  }

  // ════════════════════════════════════════════════════
  // 住戶帳單（現有功能）
  // ════════════════════════════════════════════════════
  get filteredBills(): Bill[] {
    if (this.selectedFilter === '全部') return this.bills;
    return this.bills.filter(b => b.status === this.selectedFilter);
  }

  get pendingCount(): number { return this.bills.filter(b => b.status === BillStatus.UNPAID).length; }
  get paidCount(): number    { return this.bills.filter(b => b.status === BillStatus.PAID).length; }
  get overdueCount(): number { return this.bills.filter(b => b.status === BillStatus.OVERDUE).length; }

  payBill(bill: Bill) {
    // TODO: POST /bills/{id}/pay
    bill.status = BillStatus.PAID;
    bill.paidAt = new Date().toLocaleDateString('zh-TW');
  }

  // ════════════════════════════════════════════════════
  // 管理員繳費歷史
  // ════════════════════════════════════════════════════
  get filteredAdminBills(): AdminBillRecord[] {
    let list = [...this.adminBills];

    if (this.adminSearchKeyword.trim()) {
      const kw = this.adminSearchKeyword.trim().toLowerCase();
      list = list.filter(b =>
        b.userFullName.toLowerCase().includes(kw) ||
        b.unitNumber.toLowerCase().includes(kw)
      );
    }

    if (this.adminSelectedType)   list = list.filter(b => b.billType === this.adminSelectedType);
    if (this.adminSelectedStatus) list = list.filter(b => b.status === this.adminSelectedStatus);
    if (this.adminSelectedMonth)  list = list.filter(b => b.billingMonth === this.adminSelectedMonth);

    list.sort((a, b) => b.billingMonth.localeCompare(a.billingMonth));
    return list;
  }

  get adminTotalPages(): number {
    return Math.ceil(this.filteredAdminBills.length / this.adminPageSize);
  }

  get pagedAdminBills(): AdminBillRecord[] {
    const start = (this.adminCurrentPage - 1) * this.adminPageSize;
    return this.filteredAdminBills.slice(start, start + this.adminPageSize);
  }

  get adminPageNumbers(): number[] {
    return Array.from({ length: this.adminTotalPages }, (_, i) => i + 1);
  }

  get adminTotalAmount(): number {
    return this.filteredAdminBills.reduce((sum, b) => sum + b.amount, 0);
  }

  get adminPaidAmount(): number {
    return this.filteredAdminBills.filter(b => b.status === BillStatus.PAID).reduce((sum, b) => sum + b.amount, 0);
  }

  get adminUnpaidCount(): number {
    return this.filteredAdminBills.filter(b => b.status === BillStatus.UNPAID).length;
  }

  get adminOverdueCount(): number {
    return this.filteredAdminBills.filter(b => b.status === BillStatus.OVERDUE).length;
  }

  get uniqueMonths(): string[] {
    return [...new Set(this.adminBills.map(b => b.billingMonth))].sort().reverse();
  }

  onAdminFilterChange(): void { this.adminCurrentPage = 1; }

  goToAdminPage(page: number): void {
    if (page >= 1 && page <= this.adminTotalPages) this.adminCurrentPage = page;
  }

  // ════════════════════════════════════════════════════
  // 共用工具
  // ════════════════════════════════════════════════════
  getBillIcon(type: string): string {
    switch (type) {
      case BillType.WATER:       return 'water_drop';
      case BillType.ELECTRICITY: return 'bolt';
      case BillType.MANAGEMENT:  return 'apartment';
      case BillType.MAINTENANCE: return 'build';
      default:                   return 'receipt';
    }
  }

  getBillColor(type: string): string {
    switch (type) {
      case BillType.WATER:       return '#0288d1';
      case BillType.ELECTRICITY: return '#f57c00';
      case BillType.MANAGEMENT:  return '#388e3c';
      case BillType.MAINTENANCE: return '#7b1fa2';
      default:                   return '#888';
    }
  }

  getBillTypeLabel(type: string): string {
    return this.communityBillTypes.find(t => t.value === type)?.label ?? type;
  }

  formatAmount(amount: number): string {
    return `NT$ ${amount.toLocaleString()}`;
  }
}
