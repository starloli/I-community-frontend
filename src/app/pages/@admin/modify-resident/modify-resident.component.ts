import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../@service/http.service';
import { ResidentStateService } from '../../../@service/resident-state.service';
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
  styleUrls: ['./modify-resident.component.scss'],
})
export class ModifyResidentComponent implements OnInit, OnDestroy {

  allUsers: UserResponse[] = [];
  UnqualifiedUsers: UserResponse[] = []; // 這個似乎是另一個功能，暫時保留

  // 搜尋與分頁
  searchKeyword = '';
  selectedFilter: 'ALL' | 'COMPLETE' | 'INCOMPLETE' = 'ALL';
  currentPage = 1;
  pageSize = 6; // 每頁顯示 6 個卡片
  isLoading = true;
  UserRole = UserRole;

  private $destroy = new Subject<void>();

  constructor(
    private http: HttpService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private residentState: ResidentStateService
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
        // 考量到 API 命名為 get-all-residents-users，通常已經過濾過。
        // 我們改為排除確定的管理員角色，以防住戶角色欄位為空或不同格式。
        this.allUsers = res.filter(user => user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN);

        // 如果過濾後沒資料，但原始資料有資料，則保留原始資料（代表 API 已處理角色）
        if (this.allUsers.length === 0 && res.length > 0) {
          this.allUsers = res;
        }

        this.isLoading = false;
        // 即時檢查並更新 Sidebar 的紅點狀態
        const hasIncomplete = this.allUsers.some(user => user.squareFootage === null || user.squareFootage === 0);
        this.residentState.setIncompleteStatus(hasIncomplete);
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

    // 1. 關鍵字篩選
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.trim().toLowerCase();
      users = users.filter(user =>
        user.fullName.toLowerCase().includes(keyword) ||
        user.phone.toLowerCase().includes(keyword) ||
        user.unitNumber.toLowerCase().includes(keyword)
      );
    }

    // 2. 資料完整度篩選
    if (this.selectedFilter === 'COMPLETE') {
      users = users.filter(user => user.squareFootage !== null && user.squareFootage !== 0);
    } else if (this.selectedFilter === 'INCOMPLETE') {
      users = users.filter(user => user.squareFootage === null || user.squareFootage === 0);
    }

    // 3. 排序：將坪數為 null 或 0 的住戶排在最上方
    users.sort((a, b) => {
      const aIncomplete = a.squareFootage === null || a.squareFootage === 0;
      const bIncomplete = b.squareFootage === null || b.squareFootage === 0;

      if (aIncomplete && !bIncomplete) return -1;
      if (!aIncomplete && bIncomplete) return 1;
      return 0;
    });

    return users;
  }

  get pagedUsers(): UserResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  get incompleteCount(): number {
    return this.allUsers.filter(user => user.squareFootage === null || user.squareFootage === 0).length;
  }

  get completeCount(): number {
    return this.allUsers.filter(user => user.squareFootage !== null && user.squareFootage !== 0).length;
  }  get pageNumbers(): PaginationItem[] {
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
    console.log("a");

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
