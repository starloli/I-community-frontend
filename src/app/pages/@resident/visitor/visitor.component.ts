import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { VisitorServiceService } from '../../../@service/visitor-service.service';
import { VisitorDialogComponent } from '../../../dialog/visitor-dialog/visitor-dialog.component';
import { VisitorRecord } from '../../../interface/interface';
import { HttpService } from '../../../@service/http.service';

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule, CommonModule, FormsModule],
  templateUrl: './visitor.component.html',
  styleUrls: ['./visitor.component.scss']
})
export class VisitorComponent implements OnInit {
  private http = inject(HttpService);
  private dialog = inject(MatDialog);
  private visitorService = inject(VisitorServiceService);

  // Current resident's visitor records shown in the table.
  visitors: VisitorRecord[] = [];
  searchKeyword = '';
  showForm = false;
  currentPage = 1;
  pageSize = 5;

  // Estimated arrival time for the new visitor form.
  estimatedTime = '';
  minDateTime = '';

  // Used to avoid filtering text while Chinese input composition is still in progress.
  isComposing = false;

  // Form model for resident-side visitor registration.
  newVisitor = {
    visitorName: '',
    visitorPhone: '',
    licensePlate: '',
    purpose: ''
  };

  ngOnInit(): void {
    this.updateMinDateTime();
    this.getMyVisitors();
  }

  get filteredVisitors(): VisitorRecord[] {
    const keyword = this.searchKeyword.trim().toLowerCase();

    if (!keyword) {
      return this.visitors;
    }

    return this.visitors.filter(visitor =>
      visitor.visitorName.toLowerCase().includes(keyword) ||
      (visitor.visitorPhone || '').includes(keyword) ||
      (visitor.residentialAddress || '').toLowerCase().includes(keyword) ||
      (visitor.licensePlate || '').toLowerCase().includes(keyword) ||
      (visitor.purpose || '').toLowerCase().includes(keyword) ||
      (visitor.estimatedTime || '').toLowerCase().includes(keyword)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredVisitors.length / this.pageSize);
  }

  get pagedVisitors(): VisitorRecord[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredVisitors.slice(startIndex, startIndex + this.pageSize);
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  openForm(): void {
    this.showForm = true;
    this.updateMinDateTime();
    // Default the datetime picker to "now" so the resident can submit immediately.
    this.estimatedTime = this.minDateTime;
  }

  closeForm(): void {
    this.showForm = false;
    this.estimatedTime = '';
    this.newVisitor = {
      visitorName: '',
      visitorPhone: '',
      licensePlate: '',
      purpose: ''
    };
  }

  updateMinDateTime(): void {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    this.minDateTime = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
  }

  onTimeChange(event: Event): void {
    this.updateMinDateTime();
    const input = event.target as HTMLInputElement;
    const selectedValue = input.value;

    if (selectedValue && selectedValue < this.minDateTime) {
      // Clamp invalid past times back to the earliest allowed value.
      input.value = this.minDateTime;
      this.estimatedTime = this.minDateTime;
      return;
    }

    this.estimatedTime = selectedValue;
  }

  addVisitor(): void {
    if (!this.newVisitor.visitorName.trim() || !this.estimatedTime) {
      return;
    }

    const payload = {
      visitorName: this.newVisitor.visitorName.trim(),
      visitorPhone: this.newVisitor.visitorPhone.trim(),
      licensePlate: this.newVisitor.licensePlate.trim(),
      purpose: this.newVisitor.purpose.trim(),
      estimatedTime: this.estimatedTime,
      status: 'NOTYET'
    };

    this.http.postApi('/visitor/user/save', payload).subscribe(() => {
      this.getMyVisitors();
      this.closeForm();
    });
  }

  checkOut(visitorId: number): void {
    if (!visitorId) {
      return;
    }

    this.http.putApi(`/visitor/checkOut/${visitorId}`).subscribe(() => {
      this.getMyVisitors();
    });
  }

  visitorMore(visitor: VisitorRecord): void {
    // Keep compatibility with the existing dialog service state and also pass data directly.
    this.visitorService.visitorId = visitor;
    this.visitorService.permissions = 'residents';

    this.dialog.open(VisitorDialogComponent, {
      data: {
        visitor,
        permissions: 'residents'
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onCompositionStart(): void {
    this.isComposing = true;
  }

  onCompositionEnd(event: Event): void {
    this.isComposing = false;
    this.filterInput(event);
  }

  filterInput(event: Event): void {
    if (this.isComposing) {
      return;
    }

    const input = event.target as HTMLInputElement;
    // Only allow Chinese characters and English letters in the visitor name field.
    const regex = /[^a-zA-Z\u4e00-\u9fa5]/g;
    this.newVisitor.visitorName = input.value.replace(regex, '');
    input.value = this.newVisitor.visitorName;
  }

  private getMyVisitors(): void {
    this.http.getApi('/visitor/my-visitors').subscribe({
      next: (res: any) => {
        const rawData = Array.isArray(res) ? res : (res?.data || []);

        this.visitors = rawData
          .map((visitor: any) => this.normalizeVisitor(visitor))
          // Drop placeholder or malformed rows so the table does not render empty records.
          .filter((visitor: VisitorRecord) => this.hasVisibleContent(visitor))
          // Match the original resident page behavior: upcoming pending visitors first.
          .sort((a: VisitorRecord, b: VisitorRecord) => this.compareVisitors(a, b));

        this.syncCurrentPage();
      }
    });
  }

  private syncCurrentPage(): void {
    if (this.totalPages === 0) {
      this.currentPage = 1;
      return;
    }

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  private normalizeVisitor(visitor: any): VisitorRecord {
    return {
      visitorId: Number(visitor.visitorId ?? visitor.id ?? 0),
      visitorName: this.cleanText(visitor.visitorName),
      visitorPhone: this.cleanText(visitor.visitorPhone),
      licensePlate: this.cleanText(visitor.licensePlate),
      residentialAddress: this.cleanText(
        visitor.residentialAddress ??
        visitor.displayAddress ??
        visitor.hostUser?.unitNumber
      ),
      purpose: this.cleanText(visitor.purpose),
      estimatedTime: this.formatDateTime(visitor.estimatedTime),
      checkInTime: this.formatDateTime(visitor.checkInTime),
      checkOutTime: this.formatDateTime(visitor.checkOutTime),
      status: this.cleanText(visitor.status) || 'NOTYET',
      formattedEstimated: this.getSortTime(visitor.estimatedTime)
    };
  }

  private compareVisitors(a: VisitorRecord, b: VisitorRecord): number {
    const priorityA = this.getPriority(a);
    const priorityB = this.getPriority(b);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return (a.formattedEstimated || '').localeCompare(b.formattedEstimated || '');
  }

  private getPriority(visitor: VisitorRecord): number {
    const now = this.getCurrentSortTime();
    const estimated = visitor.formattedEstimated || '9999-12-31 23:59';

    // Pending future visits appear first, then current visitors, then finished visits,
    // and finally expired "not yet arrived" reservations.
    if (visitor.status === 'NOTYET' && estimated >= now) {
      return 1;
    }

    if (visitor.status === 'INSIDE') {
      return 2;
    }

    if (visitor.status === 'COMPLETED' || visitor.status === 'LEFT') {
      return 3;
    }

    if (visitor.status === 'NOTYET' && estimated < now) {
      return 4;
    }

    return 5;
  }

  private getCurrentSortTime(): string {
    return new Date().toISOString().slice(0, 16).replace('T', ' ');
  }

  private getSortTime(value?: string | null): string {
    // Use a far-future fallback so missing reservation times sink to the bottom.
    return typeof value === 'string' && value.trim()
      ? value.replace('T', ' ').slice(0, 16)
      : '9999-12-31 23:59';
  }

  private hasVisibleContent(visitor: VisitorRecord): boolean {
    return Boolean(
      visitor.visitorName ||
      visitor.visitorPhone ||
      visitor.licensePlate ||
      visitor.residentialAddress ||
      visitor.purpose ||
      visitor.estimatedTime ||
      visitor.checkInTime ||
      visitor.checkOutTime
    );
  }

  private cleanText(value?: string | null): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private formatDateTime(value?: string | null): string {
    return typeof value === 'string' && value.trim()
      ? value.replace('T', ' ').slice(0, 16)
      : '';
  }

  //住戶刪除訪客
  deleteByVisitor(id: number) {
    this.http.deleteApi('/visitor/delete/' + id).subscribe({
      next: (res: any) => {
        console.log('刪除成功', res);
        // 成功後才重新獲取清單，確保畫面數據是最新的
        this.getMyVisitors();
      },
      error: (err) => {
        console.error('刪除失敗', err);
        alert('刪除失敗：' + (err.error?.message || '伺服器錯誤'));
      }
    });
  }
}

