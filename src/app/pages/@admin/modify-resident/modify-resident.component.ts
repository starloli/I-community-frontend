import { UserStatus } from './../../../interface/enum';
import { Component, OnDestroy, OnInit } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { Subject, takeUntil } from 'rxjs'
import { HttpService } from '../../../@service/http.service'
import { ResidentStateService } from '../../../@service/resident-state.service'
import { EditResidentComponent } from '../../../dialog/edit-resident/edit-resident.component'
import { UserResponse } from '../../../interface/interface'
import { UserRole } from '../../../interface/enum'
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { EditUserComponent } from '../../../dialog/edit-user/edit-user.component'
import { ActiveUserComponent } from '../../../dialog/active-user/active-user.component';
import { ToastService } from '../../../@service/toast.service';

type PaginationItem = number | '...';

@Component({
  selector: 'app-modify-resident',
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
    MatSlideToggleModule,
  ],
  templateUrl: './modify-resident.component.html',
  styleUrls: ['./modify-resident.component.scss'],
})
export class ModifyResidentComponent implements OnInit, OnDestroy {

  getUrl = '/admin/get-all-residents-users'
  putadminUrl = '/modify/admin'
  superAdminUrl = '/modify/superadmin'
  allUsers: UserResponse[] = []

  // 搜尋與分頁
  searchKeyword = ''
  selectedFilter: 'ALL' | 'COMPLETE' | 'INCOMPLETE' | 'INACTIVE' | 'PENDING' = 'ALL'
  currentPage = 1
  pageSize = 6 // 每頁顯示 6 個卡片
  isLoading = true
  role = UserRole.ADMIN;
  UserRole = UserRole
  UserStatus = UserStatus
  protected Math = Math;

  private $destroy = new Subject<void>()

  constructor(
    private http: HttpService,
    private toast: ToastService,
    private dialog: MatDialog,
    private residentState: ResidentStateService
  ) { }

  ngOnInit(): void {
    this.getUser()
  }

  ngOnDestroy(): void {
    this.$destroy.next()
    this.$destroy.complete()
  }

  getUser(): void {
    this.isLoading = true
    let getUrl = this.getUrl
    if (this.userRole === UserRole.SUPER_ADMIN) {
      getUrl = this.superAdminUrl
    }
    this.http.getApi<UserResponse[]>(getUrl).pipe(takeUntil(this.$destroy)).subscribe({
      next: (res) => {
        this.allUsers = res;
        this.allUsers.sort((a, b) => {
          const roles = [this.UserRole.SUPER_ADMIN, this.UserRole.ADMIN, this.UserRole.RESIDENT];
          return roles.indexOf(a.role) - roles.indexOf(b.role);
        }).sort((a, b) => {
          const statusOrder = [UserStatus.ACTIVE, UserStatus.PENDING, UserStatus.INACTIVE];
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        })
        console.log(res);
        this.isLoading = false;
        // 即時檢查並更新 Sidebar 的紅點狀態
        const count = this.allUsers.filter(user => user.squareFootage === null || user.squareFootage === 0).length
        this.residentState.setIncompleteCount(count)
      },
      error: (err) => {
        this.toast.error(err.message || '載入住戶資料失敗', 2000)
        this.isLoading = false
        console.error(err)
      }
    })
  }

  get userRole(): UserRole {
    const payload = JSON.parse(atob(this.token.split('.')[1]))
    console.log('角色:', payload.role)
    if (payload.role === UserRole.SUPER_ADMIN) {
      console.log('超')
    } else if (payload.role === UserRole.ADMIN) {
      console.log('普')
    }
    return payload.role
  }

  get token(): string {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('找不到TOKEN')
    }
    return token
  }

  // ---- 篩選與分頁邏輯 (新加入) ----

  get filteredUsers(): UserResponse[] {
    let users = [...this.allUsers]

    // 1. 關鍵字篩選
    if (this.searchKeyword.trim()) {
      const keyword = this.searchKeyword.trim().toLowerCase()
      users = users.filter(user =>
        user.fullName.toLowerCase().includes(keyword) ||
        user.phone.toLowerCase().includes(keyword) ||
        user.unitNumber.toLowerCase().includes(keyword)
      )
    }

    // 2. 資料完整度篩選
    if (this.selectedFilter === 'INACTIVE') {
      users = users.filter(user => user.status === UserStatus.INACTIVE)
    } else if (this.selectedFilter === 'COMPLETE') {
      users = users.filter(user => user.squareFootage !== null && user.squareFootage !== 0)
    } else if (this.selectedFilter === 'INCOMPLETE') {
      users = users.filter(user => user.squareFootage === null || user.squareFootage === 0)
    } else if (this.selectedFilter === 'PENDING') {
      users = users.filter(user => user.status === UserStatus.PENDING)
    }


    // 3. 排序：將坪數為 null 或 0 的住戶排在最上方
    users.sort((a, b) => {
      const aIncomplete = a.squareFootage === null || a.squareFootage === 0
      const bIncomplete = b.squareFootage === null || b.squareFootage === 0

      if (aIncomplete && !bIncomplete) return -1
      if (!aIncomplete && bIncomplete) return 1
      return 0
    })

    return users
  }

  get pagedUsers(): UserResponse[] {
    const start = (this.currentPage - 1) * this.pageSize
    return this.filteredUsers.slice(start, start + this.pageSize)
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize)
  }

  get incompleteCount(): number {
    return this.allUsers.filter(user => user.squareFootage === null || user.squareFootage === 0 && user.status === UserStatus.ACTIVE).length
  }

  get completeCount(): number {
    return this.allUsers.filter(user => user.squareFootage !== null && user.squareFootage !== 0 && user.status === UserStatus.ACTIVE).length
  } get pageNumbers(): PaginationItem[] {
    // 為了避免頁碼過多，可以只顯示當前頁前後的幾個頁碼
    const total = this.totalPages
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1)
    }
    const pages: PaginationItem[] = []
    if (this.currentPage > 3) {
      pages.push(1, '...')
    }
    for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(total, this.currentPage + 2); i++) {
      pages.push(i)
    }
    if (this.currentPage < total - 2) {
      pages.push('...', total)
    }
    // 由於加入了 '...'，回傳型別需要調整，但在範本中直接使用即可
    return pages
  }

  applyFilter(event: Event) {
    this.searchKeyword = (event.target as HTMLInputElement).value
    this.onFilterChange()
  }

  onFilterChange(): void {
    this.currentPage = 1
    this.ensureCurrentPageInRange()
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1)
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1)
  }

  isPageNumber(page: PaginationItem): page is number {
    return typeof page === 'number'
  }

  private ensureCurrentPageInRange(): void {
    const totalPages = this.totalPages

    if (totalPages === 0) {
      this.currentPage = 1
      return
    }

    if (this.currentPage > totalPages) {
      this.currentPage = totalPages
    }
  }

  // ---- 原有方法 ----

  editUser(user: UserResponse): void {
    if (this.userRole === UserRole.ADMIN) {
      const dialogRef = this.dialog.open(EditResidentComponent, {
        width: '520px',
        data: { ...user }
      })
      dialogRef.afterClosed().pipe(takeUntil(this.$destroy)).subscribe(result => {
        if (result) {
          // 注意：這裡的 result 應該是完整的 user 物件
          this.updateUser(result)
        }
      })
    } else if (this.userRole === UserRole.SUPER_ADMIN) {
      const dialogRef = this.dialog.open(EditUserComponent, {
        width: '520px',
        data: { ...user }
      })
      dialogRef.afterClosed().pipe(takeUntil(this.$destroy)).subscribe(result => {
        if (result) {
          // 注意：這裡的 result 應該是完整的 user 物件
          this.updateUser(result)
        }
      })
    }
  }

  activeUser(user: UserResponse): void {
    const dialogRef = this.dialog.open(ActiveUserComponent, {
      width: '400px',
      data: { ...user }
    })
    dialogRef.afterClosed().pipe(takeUntil(this.$destroy)).subscribe(result => {
      if (result) {
        const updatedUser = { ...user, status: UserStatus.ACTIVE }
        this.updateUser(updatedUser)
      }
    })
  }

  updateUser(user: UserResponse): void {
    this.http.putApi(this.userRole === UserRole.ADMIN ? this.putadminUrl : this.superAdminUrl, user).pipe(takeUntil(this.$destroy)).subscribe({
      next: () => {
        this.toast.success('使用者資料更新成功', 2000)
        this.getUser() // 重新載入資料
      },
      error: (err) => {
        this.toast.error(err.message || '使用者資料更新失敗', 2000)
        console.error(err)
      }
    })
  }
}
