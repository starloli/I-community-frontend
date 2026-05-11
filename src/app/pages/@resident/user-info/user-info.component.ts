import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../@service/http.service';
import { UserResponse } from '../../../interface/interface';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastService } from '../../../@service/toast.service';
import { VerifyCodeType } from '../../../interface/enum';
import { AuthService } from '../../../@service/auth.service';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule, MatProgressSpinnerModule, ReactiveFormsModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent implements OnInit, OnDestroy {

  constructor(private http: HttpService, private toast: ToastService, private authService: AuthService) { }

  getUrl = "/user/me";
  modifyUrl = "/modify/myself";
  localUser!: UserResponse;
  showVerifyCodeModal: boolean = false;
  verifyEmailSend: boolean = false;
  email: string = '';
  isSubmittingVerify: boolean = false;
  isLoadingPasswordVerify: boolean = false;
  emailCodeExpiry: number = 0;

  otpCtrl = Array.from({ length: 6 }, () => new FormControl(''));

  private timer: any;

  updateUser: updateUser = {
    phone: '',
    email: '',
    verifyCode: ''
  }
  private $destroy = new Subject<void>();


  No(): void {
    this.toast.info('NO', 2000)
  }

  ngOnInit(): void {
    this.getInfo();
  }

  getInfo(): void {
    this.http.getApi<UserResponse>(this.getUrl).pipe(takeUntil(this.$destroy)).subscribe({
      next: (response) => {
        this.localUser = { ...response };
        console.log(this.localUser);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  ModifyResident(): void {
    if (this.isValid()) {
      this.updateUser.verifyCode = this.otpCtrl.map(ctrl => ctrl.value).join('');
      this.http.putApi(this.modifyUrl, this.updateUser).pipe(takeUntil(this.$destroy)).subscribe({
        next: (response) => {
          this.toast.success('修改成功', 2000)
          console.log(response);
          this.getInfo();
        },
        error: (error) => {
          this.toast.error('修改失敗', 2000)
          console.error(error);
        }
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


  sendVerifyCode() {
    this.updateUser.email = this.email.trim();
    this.toast.info("正在發送驗證碼...", 2000);
    this.authService.sendVerifyCode(this.updateUser.email, VerifyCodeType.NEW_EMAIL_VERIFY).subscribe({
      next: (res) => {
        console.log("res：", res)
        this.toast.success("驗證碼已發送", 2000);
        this.startCodeCountdown(res.expiry || 900);
        this.verifyEmailSend = true;
      },
      error: (err) => {
        console.error("err：", err)
        this.toast.error(err.message || "驗證碼發送失敗", 2000);
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

  isValid(): boolean {
    return this.isValidEmail(this.updateUser.email) && this.isValidPhone(this.updateUser.phone)&& this.isCodeValid();
  }

  isCodeValid(): boolean {
    return this.otpCtrl.every(ctrl => ctrl.value && /^\d$/.test(ctrl.value))&& this.updateUser.email.trim() === this.email.trim();
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    if (!phone) return false;
    const phoneStr = phone.toString();
    const phoneRegex = /^09\d{8}$/;
    return phoneRegex.test(phoneStr);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }

}
interface updateUser {
  phone: string;
  email: string;
  verifyCode: string;
}
