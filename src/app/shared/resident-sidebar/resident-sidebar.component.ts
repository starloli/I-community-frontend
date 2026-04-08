import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resident-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, CommonModule],
  templateUrl: './resident-sidebar.component.html',
  styleUrls: ['./resident-sidebar.component.scss']
})
export class ResidentSidebarComponent implements OnInit {
  isCollapsed = false;

  navItems = [
    { route: 'resident/dashboard', icon: 'home_work', label: '住戶首頁', color: '#5B7FA6' },
    { route: 'resident/announcement', icon: 'campaign', label: '社區公告', color: '#B07A8A' },
    { route: 'resident/bill', icon: 'receipt_long', label: '帳單繳費', color: '#B8935A' },
    { route: 'resident/visitor', icon: 'person_add', label: '訪客登記', color: '#6A9E7F' },
    { route: 'resident/facility', icon: 'meeting_room', label: '設施預約', color: '#7B7FBA' },
    { route: 'resident/package', icon: 'inventory_2', label: '我的包裹', color: '#7BA89E' },
    { route: 'resident/repair', icon: 'build', label: '我的報修', color: '#C47A5A' }
  ];

  userName = '';
  unitNumber = '';
  userInitial = '住';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  private loadUserInfo(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userName = payload.fullName || payload.sub || '住戶';
      this.unitNumber = payload.unitNumber || '';
      this.userInitial = this.userName.charAt(0) || '住';
    } catch {
      this.userName = '住戶';
    }
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
