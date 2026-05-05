import { UserRole } from './../../interface/enum';
import { DOCUMENT, CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, Renderer2, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpService } from '../../@service/http.service';
import { ResidentStateService } from '../../@service/resident-state.service';
import { User } from '../../interface/interface';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { VerifyPasswordComponent } from '../../dialog/verify-password/verify-password.component';

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
export class SidebarComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  constructor(
    private router: Router,
    private http: HttpService,
    private residentState: ResidentStateService,
    private dialog: MatDialog
  ) { }

  isCollapsed = false; // 收合狀態
  userName = '';
  unitNumber = '';
  userInitial = '';
  incompleteCount = 0; // 資料異常的住戶數量
  UserRole = UserRole;
  isMobileNavHidden = false;

  private $destroy = new Subject<void>();
  private lastScrollTop = 0;
  private removeScrollListener?: () => void;
  private removeResizeListener?: () => void;

  navItems = [
    { route: 'admin/dashboard', icon: 'home_work', label: '社區總覽', color: '#5B7FA6' },
    { route: 'admin/visitor', icon: 'person_add', label: '訪客登記', color: '#6A9E7F' },
    { route: 'admin/announcement', icon: 'campaign', label: '社區公告', color: '#B07A8A' },
    { route: 'admin/bill', icon: 'receipt_long', label: '帳單繳費', color: '#B8935A' },
    { route: 'admin/facility', icon: 'meeting_room', label: '設備管理', color: '#7B7FBA' },
    { route: 'admin/package', icon: 'inventory_2', label: '包裹管理', color: '#7BA89E' },
    { route: 'admin/repair', icon: 'build', label: '報修申請', color: '#C47A5A' },
    { route: 'admin/ModifyResident', label: '住戶管理', color: '#B07A8A', icon: 'manage_accounts' },
    { route: 'admin/FinancialDashboard', label: '財務明細', color: '#88acd2', icon: 'receipt_long' }
  ];

  // 切換收合狀態
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.checkResidentIncomplete();

    // 訂閱即時狀態更新
    this.residentState.incompleteCount$
      .pipe(takeUntil(this.$destroy))
      .subscribe(count => this.incompleteCount = count);
  }

  ngAfterViewInit(): void {
    this.bindMobileScrollListener();
    this.removeResizeListener = this.renderer.listen('window', 'resize', () => {
      this.bindMobileScrollListener();
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
    this.removeScrollListener?.();
    this.removeResizeListener?.();
  }

  // verifyPasswordDialog() {
  //   this.router.navigate(['/admin/userInfo']);
  // }

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
        // 計算坪數為 null 或 0 的住戶數量
        const count = res.filter(user => user.squareFootage === null || user.squareFootage === 0).length;
        this.residentState.setIncompleteCount(count);
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

  private bindMobileScrollListener(): void {
    this.removeScrollListener?.();
    this.isMobileNavHidden = false;

    if (!window.matchMedia('(max-width: 768px)').matches) {
      return;
    }

    const scrollHost = this.document.querySelector('.main-content') as HTMLElement | null;
    if (!scrollHost) {
      return;
    }

    this.lastScrollTop = scrollHost.scrollTop;
    this.removeScrollListener = this.renderer.listen(scrollHost, 'scroll', () => {
      const currentScrollTop = scrollHost.scrollTop;
      const delta = currentScrollTop - this.lastScrollTop;

      if (currentScrollTop <= 8) {
        this.isMobileNavHidden = false;
      } else if (delta > 8) {
        this.isMobileNavHidden = true;
      } else if (delta < -8) {
        this.isMobileNavHidden = false;
      }

      this.lastScrollTop = currentScrollTop;
    });
  }
}
