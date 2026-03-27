import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../@service/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  // 取得驗證服務與路由器，供後續權限判斷與導頁使用
  const authService = inject(AuthService);
  const router = inject(Router);

  // 未登入使用者一律導回登入頁
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 已登入但不是管理員時，禁止進入管理頁並導回首頁
  if (!authService.isAdmin()) {
    router.navigate(['/']);
    return false;
  }

  // 通過登入與管理員身分檢查後，允許進入目標路由
  return true;
};
