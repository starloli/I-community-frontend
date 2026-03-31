import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { ApiService } from '../../../@service/api.service';
import { AuthService } from '../../../@service/auth.service';
import { VisitorStatus } from '../../../interface/enum';
import { VisitorRecord } from '../../../interface/interface';

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule, CommonModule, FormsModule],
  templateUrl: './visitor.component.html',
  styleUrls: ['./visitor.component.scss']
})
export class VisitorComponent implements OnInit {
  private http = inject(ApiService);
  private auth = inject(AuthService);

  visitors: VisitorRecord[] = [];
  searchKeyword = '';
  showForm = false;

  newVisitor = {
    visitorName: '',
    visitorPhone: '',
    unitNumber: '',
    licensePlate: '',
    purpose: ''
  };

  readonly VisitorStatus = VisitorStatus;

  ngOnInit(): void {
    this.getVisitors();
  }

  getVisitors(): void {
    const currentUser = this.auth.getUser();
    const currentUnitNumber = this.cleanText(currentUser?.unitNumber);

    this.http.getApi('/visitor/getVisitor').subscribe({
      next: (res: any) => {
        const rawData = Array.isArray(res) ? res : (res?.data || []);

        this.visitors = rawData
          .map((visitor: any) => this.normalizeVisitor(visitor))
          .filter((visitor: VisitorRecord) => this.hasVisibleContent(visitor))
          .filter((visitor: VisitorRecord) => {
            if (!currentUnitNumber) {
              return true;
            }

            return visitor.residentialAddress === currentUnitNumber;
          })
          .reverse();
      }
    });
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
      (visitor.purpose || '').toLowerCase().includes(keyword)
    );
  }

  openForm(): void {
    this.showForm = true;

    const user = this.auth.getUser();
    if (user) {
      this.newVisitor.unitNumber = this.cleanText(user.unitNumber);
    }
  }

  closeForm(): void {
    this.showForm = false;
    this.newVisitor = {
      visitorName: '',
      visitorPhone: '',
      unitNumber: '',
      licensePlate: '',
      purpose: ''
    };
  }

  addVisitor(): void {
    if (!this.newVisitor.visitorName.trim()) {
      return;
    }

    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);

    const payload = {
      visitorName: this.newVisitor.visitorName.trim(),
      visitorPhone: this.newVisitor.visitorPhone.trim(),
      licensePlate: this.newVisitor.licensePlate.trim(),
      purpose: this.newVisitor.purpose.trim(),
      status: 'NOTYET',
      checkInTime: now
    };

    this.http.postApi('/visitor/saveVisitor', payload).subscribe(() => {
      this.getVisitors();
      this.closeForm();
    });
  }

  checkOut(visitor: VisitorRecord): void {
    if (!visitor.visitorId) {
      return;
    }

    this.http.putApi(`/visitor/checkOut/${visitor.visitorId}`).subscribe(() => {
      this.getVisitors();
    });
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
      status: visitor.status ?? 'NOTYET'
    };
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
}
