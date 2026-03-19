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

  currentRoute = 'dashboard';

  // 導覽列清單
  navItems = [
    { route: 'dashboard',    icon: 'home_work',    label: '社區總覽', color: '#5B7FA6' },
    { route: 'visitor',      icon: 'person_add',   label: '訪客登記', color: '#6A9E7F' },
    { route: 'announcement', icon: 'campaign',     label: '社區公告', color: '#B07A8A' },
    { route: 'bill',         icon: 'receipt_long', label: '帳單繳費', color: '#B8935A' },
    { route: 'facility',     icon: 'meeting_room', label: '設施預約', color: '#7B7FBA' },
    { route: 'package',      icon: 'inventory_2',  label: '包裹查詢', color: '#7BA89E' },
    { route: 'repair',       icon: 'build',        label: '報修申請', color: '#C47A5A' },
  ];

  // 目前 active 的 index
  activeIndex = 0;
  // hover 的 index（-1 代表沒有 hover）
  hoverIndex = -1;
  private hoverTimer: any;
  onMouseEnter(i: number) {
    clearTimeout(this.hoverTimer);
    this.hoverIndex = i;
  }

  onMouseLeave() {
    this.hoverTimer = setTimeout(() => {
      this.hoverIndex = -1;
    }, 100);
  }

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const route = event.url.replace('/', '').split('/')[0] || 'dashboard';
      this.currentRoute = route;
      this.activeIndex = this.navItems.findIndex(item => item.route === route);
    });
  }

  // 計算 sliding pill 的位置
  // 每個 nav-item 高度約 48px，間距 4px
  get pillTop(): number {
    const index = this.hoverIndex >= 0 ? this.hoverIndex : this.activeIndex;
    return index * 52 + 16; // 16px 是 padding-top
  }

  get pillColor(): string {
    const index = this.hoverIndex >= 0 ? this.hoverIndex : this.activeIndex;
    return this.navItems[index]?.color || '#5B7FA6';
  }

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  login() { this.router.navigate(['/login']); }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
