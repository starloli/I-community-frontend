import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from '../../../@service/http.service';
import { UserResponse } from '../../../interface/interface';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { UserRole } from '../../../interface/enum';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// TODO: 【Phase 6】需要導入 AuthService
// import { AuthService } from '../../../@service/auth.service';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent implements OnInit, OnDestroy {

  constructor(private http: HttpService, private snackBar: MatSnackBar) { }

  // TODO: 【Phase 6】需要注入 AuthService
  // constructor(private http: HttpService, private authService: AuthService, private snackBar: MatSnackBar) { }

  getUrl = "/user/me";
  modifyUrl = "/modify/admin";
  user!: UserResponse;
  updateUser: updateUser = {
    fullName: '',
    phone: '',
    email: '',
    password: ''
  };
  userRole!: UserRole;
  private $destroy = new Subject<void>();

  // TODO: 超級管理員個人資料修改頁面 - 密碼驗證和信箱驗證相關變量
  passwordVerified: boolean = false;
  oldPassword: string = '';
  showVerifyCodeModal: boolean = false;
  verifyCode: string = '';
  codeExpiry: number = 0;
  isSubmittingVerify: boolean = false;
  isLoadingPasswordVerify: boolean = false;

  ngOnInit(): void {
    this.getInfo();
    const payload = JSON.parse(atob(this.getToken().split('.')[1]));
    this.userRole = payload.role;

    // TODO: 【Phase 6】修改 ngOnInit() 邏輯
    // 若是超級管理員，進入前需要驗證密碼，不應立即調用 getInfo()
    //
    // 修改方式：
    // if (this.userRole === 'SUPER_ADMIN') {
    //   this.passwordVerified = false;
    // } else {
    //   this.getInfo();
    // }
  }

  getInfo(): void {
    this.http.getApi<UserResponse>(this.getUrl).pipe(takeUntil(this.$destroy)).subscribe({
      next: (res) => {
        console.log(res);

        this.user = { ...res };
        console.log('this.user:', this.user);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  ModifySelf(): void {
    if (this.isValid(this.updateUser)) {
      console.log('this.updateUser:', this.updateUser);

      this.http.putApi(this.modifyUrl, this.updateUser).pipe(takeUntil(this.$destroy)).subscribe({
        next: (response) => {
          this.snackBar.open('修改成功', '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          })
          console.log(response);
          this.getInfo();
        },
        error: (error) => {
          this.snackBar.open('修改失敗', '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          })
          console.error(error);
        }
      })
    }
  }

  // TODO: 【Phase 6】新增 verifyOldPassword() 方法
  // 功能：驗證超級管理員舊密碼
  // - 調用 authService.verifySuperAdminPassword(this.oldPassword)
  // - 若驗證成功，設置 passwordVerified = true，清空 oldPassword，調用 getInfo()
  // - 若驗證失敗，顯示錯誤提示

  // TODO: 【Phase 6】新增 submitEditForm() 方法
  // 功能：提交編輯表單前，發送驗證碼
  // - 驗證表單數據是否完整
  // - 調用 authService.sendSuperAdminPasswordChangeCode()
  // - 若成功，設置 showVerifyCodeModal = true，啟動倒計時
  // - 若失敗，顯示錯誤提示

  // TODO: 【Phase 6】新增 confirmWithVerifyCode() 方法
  // 功能：確認驗證碼，執行最終更新
  // - 驗證驗證碼是否輸入（6位數字）
  // - 組合 updateUser 和 verifyCode
  // - 調用 authService.updateSuperAdminSelf(updateData)
  // - 若成功，關閉 modal，刷新用戶信息
  // - 若失敗，顯示錯誤提示

  // TODO: 【Phase 6】新增 cancelVerification() 方法
  // 功能：取消驗證流程
  // - 關閉 showVerifyCodeModal
  // - 清空 verifyCode 和 codeExpiry

  // TODO: 【Phase 6】新增 startCodeCountdown() 方法
  // 功能：驗證碼倒計時（15分鐘 = 900秒）
  // - 每秒遞減 codeExpiry
  // - 當 codeExpiry <= 0 時停止計時

  No(): void {
    this.snackBar.open('NO', 'NO', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    })
  }

  isValid(user: updateUser): boolean {
    return Object.values(user).every(
      value =>
        value !== null &&
        value !== undefined &&
        value !== ''
    ) && this.isValidEmail(this.updateUser.email)
      && this.isValidPhone(this.updateUser.phone);
  }

  isValidSquareFootage(squareFootage: number): boolean {
    return squareFootage > 0;
  }

  isValidEmail(email?: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone?: string): boolean {
    if (!phone) return false;
    const phoneStr = phone.toString();
    const phoneRegex = /^09\d{8}$/;
    return phoneRegex.test(phoneStr);
  }

  getToken(): string {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('找不到TOKEN');
    }
    return token;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}

interface updateUser {
  fullName?: string;
  phone?: string;
  email?: string;
  password?: string;
}
