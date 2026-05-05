import { SuperAdminService } from './../../../@service/super-admin.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from '../../../@service/http.service';
import { UserResponse } from '../../../interface/interface';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserRole, VerifyCodeType } from '../../../interface/enum';

import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../@service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-info',
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressSpinnerModule, ReactiveFormsModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent implements OnInit, OnDestroy {

  constructor(
    private http: HttpService,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private router: Router) { }

  getUrl = "/user/me";
  modifyUrl = "/modify/superadmin/self";
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

  otpCtrl = Array.from({ length: 6 }, () => new FormControl(''));
  showVerifyCodeModal: boolean = false;
  verifyEmailSend: boolean = false;
  email: string = '';
  codeExpiry: number = 0;
  isSubmittingVerify: boolean = false;
  isLoadingPasswordVerify: boolean = false;
  emailCodeExpiry: number = 0;

  private timer: any;

  get verify(): boolean {
    return this.verifyEmailSend && this.email === this.updateUser.email;
  }

  sendVerifyCode() {
    this.updateUser.email = this.email.trim();
    this.snackBar.open("正在發送驗證碼...", "關閉", {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
    this.authService.sendVerifyCode(this.updateUser.email, VerifyCodeType.NEW_EMAIL_VERIFY).subscribe({
      next: (res) => {
        console.log("res：", res)
        this.snackBar.open("驗證碼已發送", "關閉", {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.startCodeCountdown(res.expiry || 900);
        this.verifyEmailSend = true;
      },
      error: (err) => {
        if (err.error.message == "此信箱已註冊") {
          this.snackBar.open(err.error.message, "關閉", {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        }
        console.error("err：", err)
        this.snackBar.open("驗證碼發送失敗", "關閉", {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
      }
    })
  }

  startCodeCountdown(expiry: number) {
    this.emailCodeExpiry = expiry;
    this.timer = setInterval(() => {
      if (this.emailCodeExpiry > 0) {
        this.emailCodeExpiry--;
      } else {
        clearInterval(this.timer);
      }
    }, 1000);
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
    this.updateUser.verifyCode = this.otpCtrl.map(ctrl => ctrl.value).join('');
    console.log(this.updateUser);
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
          this.router.navigate(['/admin/dashboard']);
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
    } else {
      this.snackBar.open('請填寫完整且有效的資料', '關閉', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      })
    }
  }
  onInput(event: any, index: number) {

    const value = event.target.value;

    if (!/^[0-9]$/.test(value)) {
      this.otpCtrl[index].setValue('');
      return;
    }

    if (value && index < 5) {
      const nextInput = event.target.parentElement.children[index + 1];
      nextInput.focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    const pasteData = event.clipboardData?.getData('text').slice(0, 6) || '';

    if (!/^\d+$/.test(pasteData)) return;

    pasteData.split('').forEach((num, i) => {
      if (this.otpCtrl[i]) {
        this.otpCtrl[i].setValue(num);
      }
    });

    event.preventDefault();
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpCtrl[index].value && index > 0) {
      const prevInput = (event.target as HTMLElement).parentElement!.children[index - 1];
      (prevInput as HTMLElement).focus();
    }
  }
  // TODO: 【Phase 6】新增 sendOldEmailVerifyCode() 方法
  // 功能：發送舊信箱驗證碼（頁面入口驗證）
  // - 調用 authService.sendVerifyCode(user.email, 'OLD_EMAIL_VERIFY')
  // - 若成功，設置 showOldEmailVerifyModal = true，啟動倒計時
  // - 若失敗，顯示錯誤提示

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
      && this.isValidPhone(this.updateUser.phone) && this.verify;
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
    clearInterval(this.timer);
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
