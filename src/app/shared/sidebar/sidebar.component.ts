import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  constructor(private router: Router) { }

  // 登出：清除 token 並跳轉到登入頁面
  // TODO: 之後加入清除 localStorage token 的邏輯
  login() {
    // localStorage.removeItem('token'); // 之後串接 JWT 時取消註解
    this.router.navigate(['/login']);
  }
}
