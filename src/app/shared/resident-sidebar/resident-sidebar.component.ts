import { DOCUMENT, CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit, Renderer2, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HttpService } from '../../@service/http.service';
import { User } from '../../interface/interface';

@Component({
  selector: 'app-resident-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  templateUrl: './resident-sidebar.component.html',
  styleUrls: ['./resident-sidebar.component.scss']
})
export class ResidentSidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  constructor(private router: Router, private http: HttpService) {}

  isCollapsed = false;
  isMobileNavHidden = false;
  private lastScrollTop = 0;
  private removeScrollListener?: () => void;
  private removeResizeListener?: () => void;

  navItems = [
    { route: 'resident/dashboard', icon: 'home_work', label: '住戶首頁', color: '#5B7FA6' },
    { route: 'resident/announcement', icon: 'campaign', label: '社區公告', color: '#B07A8A' },
    { route: 'resident/bill', icon: 'receipt_long', label: '帳單繳費', color: '#B8935A' },
    { route: 'resident/visitor', icon: 'person_add', label: '訪客登記', color: '#6A9E7F' },
    { route: 'resident/facility', icon: 'meeting_room', label: '設施預約', color: '#7B7FBA' },
    { route: 'resident/package', icon: 'inventory_2', label: '我的包裹', color: '#7BA89E' },
    { route: 'resident/repair', icon: 'build', label: '我的報修', color: '#C47A5A' },
        {route :'resident/FinancialDashboardResidentComponent', label: '財務明細', color: '#88acd2', icon: 'receipt_long'}
  ];

  userName = '';
  unitNumber = '';
  userInitial = '';

  ngOnInit(): void {
    this.loadUserInfo();
  }

  ngAfterViewInit(): void {
    this.bindMobileScrollListener();
    this.removeResizeListener = this.renderer.listen('window', 'resize', () => {
      this.bindMobileScrollListener();
    });
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

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  ngOnDestroy(): void {
    this.removeScrollListener?.();
    this.removeResizeListener?.();
  }

  logout(): void {
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
