import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-resident-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  templateUrl: './resident-sidebar.component.html',
  styleUrl: './resident-sidebar.component.scss'
})
export class ResidentSidebarComponent implements OnInit {

  isCollapsed = false;

  // ── 住戶選單（沒有訪客登記）────────────────────────
  navItems = [
    { route: 'resident/dashboard',    icon: 'home_work',    label: '我的總覽',  color: '#5B7FA6' },
    { route: 'resident/announcement', icon: 'campaign',     label: '社區公告',  color: '#B07A8A' },
    { route: 'resident/bill',         icon: 'receipt_long', label: '帳單繳費',  color: '#B8935A' },
    { route: 'resident/facility',     icon: 'meeting_room', label: '設施預約',  color: '#7B7FBA' },
    { route: 'resident/package',      icon: 'inventory_2',  label: '我的包裹',  color: '#7BA89E' },
    { route: 'resident/repair',       icon: 'build',        label: '我的報修',  color: '#C47A5A' },
  ];

  activeIndex = 0;
  hoverIndex = -1;
  private hoverTimer: any;

  // ── 住戶資訊（從 JWT token 解析）──────────────────
  userName = '';
  unitNumber = '';
  userInitial = '住';

  constructor(private router: Router) {}

  ngOnInit() {
    // 從 token 取得住戶資訊
    this.loadUserInfo();

    const initIndex = this.navItems.findIndex(item => this.router.url.includes(item.route));
    this.activeIndex = initIndex >= 0 ? initIndex : 0;

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const index = this.navItems.findIndex(item => event.url.includes(item.route));
      this.activeIndex = index >= 0 ? index : 0;
    });
  }

  private loadUserInfo() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userName   = payload.fullName   || payload.sub || '住戶';
      this.unitNumber = payload.unitNumber || '';
      this.userInitial = this.userName.charAt(0) || '住';
    } catch {
      this.userName = '住戶';
    }
  }

  toggleCollapse() { this.isCollapsed = !this.isCollapsed; }

  onMouseEnter(i: number) {
    clearTimeout(this.hoverTimer);
    this.hoverIndex = i;
  }

  onMouseLeave() {
    this.hoverTimer = setTimeout(() => { this.hoverIndex = -1; }, 100);
  }

  get pillTop(): number {
    const index = this.hoverIndex >= 0 ? this.hoverIndex : this.activeIndex;
    // header(72px) + user-info(64px) + nav padding(16px) + index * 52px
    return index * 52 + 16;
  }

  get pillColor(): string {
    const index = this.hoverIndex >= 0 ? this.hoverIndex : this.activeIndex;
    return this.navItems[index]?.color || '#5B7FA6';
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
