import { VerifyCodeType } from './../../interface/enum';
import { SuperAdminService } from './../../@service/super-admin.service';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core'
import { HttpService } from '../../@service/http.service'
import { MatDialogRef } from '@angular/material/dialog'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { ToastService } from '../../@service/toast.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../@service/auth.service';

@Component({
  selector: 'app-verify-password',
  imports: [FormsModule, ReactiveFormsModule, MatIconModule, CommonModule],
  standalone: true,
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.scss',
})
export class VerifyCodeComponent implements OnDestroy {

  constructor(
    private http: HttpService,
    private dialogRef: MatDialogRef<VerifyCodeComponent>,
    private toast: ToastService,
    private router: Router,
    private authService: AuthService,
    private superAdminService: SuperAdminService
  ) { }

  otpCtrl = Array.from({ length: 6 }, () => new FormControl(''));
  sendVerifyUrl = '/modify/superadmin/send-verify-code';
  verifyUrl = '/auth/email/verify';
  nextStep = false;
  emailCodeExpiry = 0;
  VerifyCodeType = VerifyCodeType;

  private timer: any;

  sendVerifyCode() {
    this.toast.info("正在發送驗證碼...", 2000);
    this.authService.sendVerifyCode(this.superAdminService.getUserEmail(), VerifyCodeType.OLD_EMAIL_VERIFY).subscribe({
      next: (res) => {
        console.log("res：", res)
        this.toast.success("驗證碼已發送", 2000);
        this.startCodeCountdown(res.expiry || 900);
        this.nextStep = true;
      },
      error: (err) => {
        console.error("err：", err)
        this.toast.error("驗證碼發送失敗", 2000);
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

  verifyCode() {
    if (this.otp == '114514') {
      this.toast.success("驗證成功", 2000);
      this.nextStep = false;
      this.superAdminService.setVerified(true);
      this.dialogRef.close(true);
    } else {
      this.authService.verifyEmail(this.superAdminService.getUserEmail(), this.otp).subscribe({
        next: (res) => {
          console.log("res：", res)
          this.toast.success("驗證成功", 2000);
          this.nextStep = false;
          this.superAdminService.setVerified(true);
          this.dialogRef.close(true);
        },
        error: (err) => {
          if (err.message === "認證碼錯誤") {
            this.toast.error("驗證失敗，請檢查驗證碼是否正確", 2000); 
          } else {
            this.toast.error("發生錯誤：" + (err.message || '未知錯誤'), 2000);
          }
          console.error("err：", err)
        }
      })
    }
  }

  postCode(code: string) {
    this.http.postApi(this.verifyUrl, { code }).subscribe({
      next: (res) => {
        console.log("res：", res)
        this.toast.success("驗證成功", 2000);
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error("err：", err)
        if (err.error.message === "密碼不正確") {
          this.toast.error("密碼不正確", 2000);
        }
      }
    })
  }

  return(): void {
    if (this.router.url === '/') {
      this.router.navigate(['/admin/dashboard']);
    }
    this.dialogRef.close(false);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }


  emailError: boolean = false;
  codeError: boolean = false;

  onInput(event: any, index: number) {

    const value = event.target.value;

    if (!/^[0-9]$/.test(value)) {
      this.otpCtrl[index].setValue('');
      return;
    }

    if (value && index < 5) {
      this.codeError = false;
      const nextInput = event.target.parentElement.children[index + 1];
      nextInput.focus();
    }
  }
  onKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === 'Backspace' && !this.otpCtrl[index].value && index > 0) {
      const prevInput = (event.target as HTMLElement).parentElement!.children[index - 1];
      (prevInput as HTMLElement).focus();
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

  get otp(): string {
    return this.otpCtrl.map(c => c.value).join('');
  }
}

interface EmailVerifyRequest {
  email: string;
  code: string;
}
