import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../@service/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  // 取得驗證服務與路由器，供後續權限判斷與導頁使用
  const authService = inject(AuthService);
  const router = inject(Router);

  // 未登入使用者一律導回登入頁
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // 通過登入檢查後，允許進入目標路由
  return true;
};
