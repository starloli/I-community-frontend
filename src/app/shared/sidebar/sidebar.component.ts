import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

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
export class SidebarComponent {
  isCollapsed = false; // 收合狀態

  navItems = [
    { route: 'admin/dashboard', icon: 'home_work', label: '社區總覽', color: '#5B7FA6' },
    { route: 'admin/visitor', icon: 'person_add', label: '訪客登記', color: '#6A9E7F' },
    { route: 'admin/announcement', icon: 'campaign', label: '社區公告', color: '#B07A8A' },
    { route: 'admin/bill', icon: 'receipt_long', label: '帳單繳費', color: '#B8935A' },
    { route: 'admin/facility', icon: 'meeting_room', label: '設施管理', color: '#7B7FBA' },
    { route: 'admin/package', icon: 'inventory_2', label: '包裹查詢', color: '#7BA89E' },
    { route: 'admin/repair', icon: 'build', label: '報修申請', color: '#C47A5A' },
  ];

  constructor(private router: Router) { }

  // 切換收合狀態
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
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
