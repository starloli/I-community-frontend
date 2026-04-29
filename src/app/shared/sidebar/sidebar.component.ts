import { UserRole } from './../../interface/enum';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../@service/http.service';
import { ResidentStateService } from '../../@service/resident-state.service';
import { User } from '../../interface/interface';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  host: {
    '[class.sidebar-collapsed-host]': 'isCollapsed'
  }
})
export class SidebarComponent implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private http: HttpService,
    private residentState: ResidentStateService
  ) { }

  isCollapsed = false; // 收合狀態
  userName = '';
  unitNumber = '';
  userInitial = '';
  hasIncompleteResident = false; // 是否有坪數為 null 或 0 的住戶
  UserRole = UserRole;

  private $destroy = new Subject<void>();

  navItems = [
    { route: 'admin/dashboard', icon: 'home_work', label: '社區總覽', color: '#5B7FA6' },
    { route: 'admin/visitor', icon: 'person_add', label: '訪客登記', color: '#6A9E7F' },
    { route: 'admin/announcement', icon: 'campaign', label: '社區公告', color: '#B07A8A' },
    { route: 'admin/bill', icon: 'receipt_long', label: '帳單繳費', color: '#B8935A' },
    { route: 'admin/facility', icon: 'meeting_room', label: '設備管理', color: '#7B7FBA' },
    { route: 'admin/package', icon: 'inventory_2', label: '包裹管理', color: '#7BA89E' },
    { route: 'admin/repair', icon: 'build', label: '報修申請', color: '#C47A5A' },
    { route: 'admin/ModifyResident', label: '住戶管理', color: '#5B7FA6', icon: 'manage_accounts' },
    {route :'admin/FinancialDashboard', label: '財務明細', color: '#88acd2', icon: 'receipt_long'}
  ];

  // TODO: 超級管理員的個人資料編輯按鈕待實作

  // 切換收合狀態
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    }

  ngOnInit(): void {
    this.loadUserInfo();
    this.checkResidentIncomplete();

    // 訂閱即時狀態更新
    this.residentState.hasIncompleteResident$
      .pipe(takeUntil(this.$destroy))
      .subscribe(status => this.hasIncompleteResident = status);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

  private loadUserInfo(): void {
    const getUrl = "/user/me";
    this.http.getApi<User>(getUrl).subscribe({
      next: (res) => {
        this.userName = res.fullName || '住戶';
        this.unitNumber = res.unitNumber || '';
        this.userInitial = this.userName.charAt(0) || '';
      },
      error: (error) => {
        console.error('取得住戶資訊失敗:', error);
      }
    });
  }

  private checkResidentIncomplete(): void {
    const getUrl = "/admin/get-all-residents-users";
    this.http.getApi<any[]>(getUrl).subscribe({
      next: (res) => {
        // 檢查是否有坪數為 null 或 0 的住戶，並更新服務狀態
        const hasIncomplete = res.some(user => user.squareFootage === null || user.squareFootage === 0);
        this.residentState.setIncompleteStatus(hasIncomplete);
      },
      error: (error) => {
        console.error('取得住戶清單失敗:', error);
      }
    });
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  get userRole(): UserRole {
    const payload = JSON.parse(atob(this.token.split('.')[1]))
    return payload.role
  }

  get token(): string {
    const token = localStorage.getItem('token')
    if (!token) {
      throw new Error('找不到TOKEN')
    }
    return token
  }

  login() { this.router.navigate(['/login']); }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
