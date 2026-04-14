import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../@service/http.service';
import { User } from '../../interface/interface';

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
export class SidebarComponent implements OnInit {

  constructor(private router: Router, private http: HttpService) { }

  isCollapsed = false; // 收合狀態
  userName = '';
  unitNumber = '';
  userInitial = '';

  navItems = [
    { route: 'admin/dashboard', icon: 'home_work', label: '社區總覽', color: '#5B7FA6' },
    { route: 'admin/visitor', icon: 'person_add', label: '訪客登記', color: '#6A9E7F' },
    { route: 'admin/announcement', icon: 'campaign', label: '社區公告', color: '#B07A8A' },
    { route: 'admin/bill', icon: 'receipt_long', label: '帳單繳費', color: '#B8935A' },
    { route: 'admin/facility', icon: 'meeting_room', label: '設施管理', color: '#7B7FBA' },
    { route: 'admin/package', icon: 'inventory_2', label: '包裹管理', color: '#7BA89E' },
    { route: 'admin/repair', icon: 'build', label: '報修申請', color: '#C47A5A' },
    { route: 'admin/ModifyResident', label: '住戶管理', color: '#5B7FA6', icon: 'manage_accounts' },
  ];


  // 切換收合狀態
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    }

  ngOnInit(): void {
    this.loadUserInfo();
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

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  login() { this.router.navigate(['/login']); }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
