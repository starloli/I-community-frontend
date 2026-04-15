import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../@service/http.service';
import { EditResident } from '../../../dialog/edit-resident/edit-resident.component';
import { UserResponse } from '../../../interface/interface';
import { UserRole } from '../../../interface/enum';

// 由於我們將使用自訂分頁，所以不再需要 MatPaginator
// 同時，我們需要 CommonModule 來使用 @for, @if 等
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

type PaginationItem = number | '...';

@Component({
  selector: 'app-modify-resident',
  // 將元件轉換為 standalone，並導入所有需要的模組
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    EditResident, // 導入獨立的 Dialog 元件
  ],
  templateUrl: './modify-resident.component.html',
  styleUrls: ['./modify-resident.component.scss'], // 注意這裡是 styleUrls (複數)
})
export class ModifyResidentComponent implements OnInit, OnDestroy {

  private allUsers: UserResponse[] = [];
  UnqualifiedUsers: UserResponse[] = []; // 這個似乎是另一個功能，暫時保留

  // 搜尋與分頁
  searchKeyword = '';
  currentPage = 1;
  pageSize = 6; // 每頁顯示 6 個卡片
  isLoading = true;
  UserRole = UserRole;

  private $destroy = new Subject<void>();

  constructor(
    private http: HttpService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getUser();
    this.getUnqualifiedResident();
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  getUser(): void {
    this.isLoading = true;
    this.http.getApi<UserResponse[]>('/admin/get-all-residents-users').pipe(takeUntil(this.$destroy)).subscribe({
      next: (res) => {
        this.allUsers = res;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open(err.message || '載入住戶資料失敗', '關閉', { duration: 3000 });
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  // ---- 篩選與分頁邏輯 (新加入) ----

  get filteredUsers(): UserResponse[] {
    let users = [...this.allUsers];
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.trim().toLowerCase();
      users = users.filter(user =>
        user.fullName.toLowerCase().includes(keyword) ||
        user.phone.toLowerCase().includes(keyword) ||
        user.unitNumber.toLowerCase().includes(keyword)
      );
    }
    return users;
  }

  get pagedUsers(): UserResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  get pageNumbers(): PaginationItem[] {
    // 為了避免頁碼過多，可以只顯示當前頁前後的幾個頁碼
    const total = this.totalPages;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: PaginationItem[] = [];
    if (this.currentPage > 3) {
      pages.push(1, '...');
    }
    for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(total, this.currentPage + 2); i++) {
      pages.push(i);
    }
    if (this.currentPage < total - 2) {
      pages.push('...', total);
    }
    // 由於加入了 '...'，回傳型別需要調整，但在範本中直接使用即可
    return pages;
  }

  applyFilter(event: Event) {
    this.searchKeyword = (event.target as HTMLInputElement).value;
    this.onFilterChange();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.ensureCurrentPageInRange();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  isPageNumber(page: PaginationItem): page is number {
    return typeof page === 'number';
  }

  private ensureCurrentPageInRange(): void {
    const totalPages = this.totalPages;

    if (totalPages === 0) {
      this.currentPage = 1;
      return;
    }

    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }
  }

  // ---- 原有方法 ----

  editUser(user: UserResponse): void {
    const dialogRef = this.dialog.open(EditResident, {
      width: '520px',
      data: { ...user }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.$destroy)).subscribe(result => {
      if (result) {
        // 注意：這裡的 result 應該是完整的 user 物件
        this.updateUser(result);
      }
    });
  }

  updateUser(user: UserResponse): void {
    this.http.putApi('/modify/admin', user).pipe(takeUntil(this.$destroy)).subscribe({
      next: () => {
        this.snackBar.open('使用者資料更新成功', '關閉', { duration: 2000 });
        this.getUser(); // 重新載入資料
      },
      error: (err) => {
        this.snackBar.open(err.message || '使用者資料更新失敗', '關閉', { duration: 3000 });
        console.error(err);
      }
    });
  }

  getUnqualifiedResident(): void {
    this.http.getApi<UserResponse[]>("/modify/getUnqualifiedUser").pipe(takeUntil(this.$destroy)).subscribe({
      next: (res) => {
        this.UnqualifiedUsers = res;
      },
      error: (err) => {
        // 避免重複的錯誤提示
        console.error('載入未驗證住戶資料失敗:', err);
      }
    });
  }
}
