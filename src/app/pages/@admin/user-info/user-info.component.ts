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
import { AuthService } from '../../../@service/auth.service';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent implements OnInit, OnDestroy {

  constructor(private http: HttpService, private snackBar: MatSnackBar, private authService: AuthService) { }

  getUrl = "/user/me";
  modifyUrl = "/modify/admin";
  verifyUrl = "/modify/superadmin/send-verify-code";
  user!: UserResponse;
  updateUser: updateUser = {
    fullName: '',
    phone: '',
    email: '',
    password: '',
    verifyCode: ''
  };
  userRole!: UserRole;
  private $destroy = new Subject<void>();

  // TODO: 【Phase 6】超級管理員個人資料修改頁面 - 純電子郵件驗證相關變量
  // 狀態變量：
  //
  // - newEmailVerifyCode: 新信箱驗證碼輸入值
  // - newEmailCodeExpiry: 新信箱驗證碼倒計時（秒）
  // - showNewEmailVerifyModal: 新信箱驗證 modal 顯示狀態
  // - newEmailVerified: 新信箱驗證狀態
  //
  // - isSubmittingOldEmailVerify: 舊信箱驗證提交中
  // - isSubmittingNewEmailVerify: 新信箱驗證提交中
  // - isVerifyCodeCountdownActive: 倒計時進行中

  showVerifyCodeModal: boolean = false;
  emailVerified: boolean = false;
  verifiedEmail: string = '';
  codeExpiry: number = 0;
  isSubmittingVerify: boolean = false;
  isLoadingPasswordVerify: boolean = false;

  set updateEmail(value: string) {
    this.updateUser.email = value;
    if (!this.verify) {

    }
  }

  get verify(): boolean {
    return this.emailVerified && this.verifiedEmail === this.updateUser.email;
  }

  verifyEmail(email: string): void {
    this.showVerifyCodeModal = true;
  }

  ngOnInit(): void {
    this.getInfo();
    const payload = JSON.parse(atob(this.getToken().split('.')[1]));
    this.userRole = payload.role;
  }

  getInfo(): void {
    this.http.getApi<UserResponse>(this.getUrl).pipe(takeUntil(this.$destroy)).subscribe({
      next: (res) => {
        console.log(res);
        this.user = { ...res };
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

  // TODO: 【Phase 6】新增 sendOldEmailVerifyCode() 方法
  // 功能：發送舊信箱驗證碼（頁面入口驗證）
  // - 調用 authService.sendVerifyCode(user.email, 'OLD_EMAIL_VERIFY')
  // - 若成功，設置 showOldEmailVerifyModal = true，啟動倒計時
  // - 若失敗，顯示錯誤提示

  // TODO: 【Phase 6】新增 verifyOldEmail() 方法
  // 功能：驗證舊信箱驗證碼
  // - 驗證驗證碼是否輸入（6位數字）
  // - 調用 authService.verifyEmailCode(user.email, oldEmailVerifyCode, 'OLD_EMAIL_VERIFY')
  // - 若成功，設置 oldEmailVerified = true，關閉 modal
  // - 若失敗，顯示錯誤提示，清空驗證碼

  // TODO: 【Phase 6】新增 submitEditForm() 方法
  // 功能：提交編輯表單，發送新信箱驗證碼
  // - 驗證表單數據是否完整和新信箱是否有效
  // - 調用 authService.sendVerifyCode(updateUser.email, 'NEW_EMAIL_VERIFY')
  // - 若成功，設置 showNewEmailVerifyModal = true，啟動倒計時
  // - 若失敗，顯示錯誤提示

  // TODO: 【Phase 6】新增 confirmWithVerifyCode() 方法
  // 功能：確認新信箱驗證碼，執行最終更新
  // - 驗證驗證碼是否輸入（6位數字）
  // - 調用 authService.verifyEmailCode(updateUser.email, newEmailVerifyCode, 'NEW_EMAIL_VERIFY')
  // - 若驗證碼驗證成功，組合 updateUser 和 verifyCode
  // - 調用 authService.updateSuperAdminSelf(updateData)
  // - 若成功，關閉 modal，顯示成功提示，刷新用戶信息
  // - 若失敗，顯示錯誤提示

  // TODO: 【Phase 6】新增 cancelVerification() 方法
  // 功能：取消驗證流程
  // - 關閉 showOldEmailVerifyModal 或 showNewEmailVerifyModal
  // - 清空相應的驗證碼和倒計時
  // - 如果是舊信箱驗證被取消，oldEmailVerified 保持 false

  // TODO: 【Phase 6】新增 startCodeCountdown() 方法
  // 功能：驗證碼倒計時（15分鐘 = 900秒）
  // - 接收參數：type ('OLD_EMAIL' 或 'NEW_EMAIL')
  // - 每秒遞減對應的 codeExpiry
  // - 當 codeExpiry <= 0 時停止計時並清空驗證碼

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
  fullName: string;
  phone: string;
  email: string;
  password: string;
  verifyCode: string;
}
