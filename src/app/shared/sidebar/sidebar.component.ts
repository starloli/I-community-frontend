import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {

  isLogin: boolean = false;
  currentRoute = 'dashboard';
  isCollapsed = false; // 收合狀態

  navItems = [
    { route: 'admin/dashboard', icon: 'home_work', label: '社區總覽', color: '#5B7FA6' },
    { route: 'admin/visitor', icon: 'person_add', label: '訪客登記', color: '#6A9E7F' },
    { route: 'admin/announcement', icon: 'campaign', label: '社區公告', color: '#B07A8A' },
    { route: 'admin/bill', icon: 'receipt_long', label: '帳單繳費', color: '#B8935A' },
    { route: 'admin/facility', icon: 'meeting_room', label: '設施預約', color: '#7B7FBA' },
    { route: 'admin/package', icon: 'inventory_2', label: '包裹查詢', color: '#7BA89E' },
    { route: 'admin/repair', icon: 'build', label: '報修申請', color: '#C47A5A' },
  ];

  activeIndex = 0;
  hoverIndex = -1;
  private hoverTimer: any;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // 初始化時根據完整 url 比對 navItems
    const initIndex = this.navItems.findIndex(item => this.router.url.includes(item.route));
    this.activeIndex = initIndex >= 0 ? initIndex : 0;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const index = this.navItems.findIndex(item => event.url.includes(item.route));
      this.activeIndex = index >= 0 ? index : 0;
    });

    this.isLogin = this.authService.isLoggedIn();
  }

  // 切換收合狀態
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  onMouseEnter(i: number) {
    clearTimeout(this.hoverTimer);
    this.hoverIndex = i;
  }

  onMouseLeave() {
    this.hoverTimer = setTimeout(() => {
      this.hoverIndex = -1;
    }, 100);
  }

  get pillTop(): number {
    const index = this.hoverIndex >= 0 ? this.hoverIndex : this.activeIndex;
    return index * 52 + 16;
  }

  get pillColor(): string {
    const index = this.hoverIndex >= 0 ? this.hoverIndex : this.activeIndex;
    return this.navItems[index]?.color || '#5B7FA6';
  }

  login() { this.router.navigate(['/login']); }

  logout() {
    this.authService.logout()
  }
}
