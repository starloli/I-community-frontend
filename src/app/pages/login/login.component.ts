import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';


import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../@service/auth.service';
import { HttpService } from '../../@service/http.service';
import { ToastService } from '../../@service/toast.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(
    private router: Router,
    private http: HttpService,
    private auth: AuthService,
    private toast: ToastService
  ) { }

  booleanSignup = false;
  booleanIsManager: boolean = false;
  signUpStep: number = 1;

  userName!: string;
  password!: string;
  userloginStatus = true;

  signUpUserName: string = '';
  signUpPassword: string = '';
  confirmPassword: string = '';
  fullName!: string;
  email: string = '';
  phone: string = '';
  unitNumber: string = '';

  adminAccountn!: string;
  adminPassword!: string;
  isManagerStatus = true;

  isConfirmTouched = false;
  isClickPhone = false;
  isClickEmail = false;
  isPasswordLength = false;


  // imageSrc='login_bg.png';
  checkSignUpUserName!: boolean;


  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    if (!phone) return false;
    const phoneRegex = /^09\d{8}$/;
    return phoneRegex.test(phone);
  }

  // ── 登入 API ──────────────────────────────────────────
  useLoginApi() {
    const loginAccount = {
      userName: this.userName,
      password: this.password
    };

    this.http.postApi('/auth/login', loginAccount).subscribe({
      next: (res: any) => {
        this.userloginStatus = true;
        localStorage.setItem('token', res.accessToken);

        let roleDisplay = '';
        try {
          const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
          const role = payload.role;

          // 角色顯示名稱映射
          const roleMap: { [key: string]: string } = {
            'SUPER_ADMIN': '超級管理員',
            'ADMIN': '管理員',
            'RESIDENT': '住戶',
            'GUARD': '警衛保全'
          };
          roleDisplay = roleMap[role] || '使用者';

          // 顯示登入成功 Toast
          this.toast.success(`登入成功\n您的身分為：${roleDisplay}`);

          // 根據角色導向不同路由
          if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/resident/dashboard']);
          }
        } catch {
          this.toast.success('登入成功');
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err: HttpErrorResponse) => {
        const errorCode = err.error?.errorCode;
        
        switch (errorCode) {
          case 'ACCOUNT_PENDING':
            this.toast.error('帳號尚未啟用，請聯繫管理員');
            break;
          case 'ACCOUNT_INACTIVE':
            this.toast.error('帳號已被停用，請聯繫管理員');
            break;
          default:
            this.toast.error('登入失敗，請檢查帳號與密碼');
            this.userloginStatus = false;
        }
      }
    });
  }

  // ── 註冊 API ──────────────────────────────────────────
  signUpApi() {
    const signupData = {
      userName: this.signUpUserName,
      password: this.signUpPassword,
      fullName: this.fullName,
      email: this.email,
      phone: this.phone,
      unitNumber: this.unitNumber,
    };
    this.http.postApi('/auth/register', signupData).subscribe((res: any) => {
      console.log(res);
      console.log('註冊成功');
      this.signUpUserName = '';
      this.signUpPassword = '';
      this.confirmPassword = '';
      this.fullName = '';
      this.email = '';
      this.unitNumber = '';
      this.backLogin();
    });
  }

  adminLoginApi() {
    this.isManagerStatus = false;
  }

  loginstatus() { this.userloginStatus = true; }
  adminloginstatus() { this.isManagerStatus = true; }

  sign_up() { this.booleanSignup = !this.booleanSignup; }

  switchUser() {
    this.booleanIsManager = !this.booleanIsManager;
    this.userName = '';
    this.password = '';
    this.adminAccountn = '';
    this.adminPassword = '';
    this.isManagerStatus = true;
    this.userloginStatus = true;
  }

  Stepper1() {
    if (this.signUpStep === 1) {
      if (!this.signUpUserName?.trim() || !this.signUpPassword?.trim() ||
        !this.confirmPassword?.trim() ||
        this.signUpPassword.length < 6 || this.signUpPassword.length > 12) return;

      if (this.signUpPassword !== this.confirmPassword) return;

      this.http.getApi("/auth/checking/userName?name=" + this.signUpUserName).subscribe({
        next: (isExists: any) => {
          if (isExists) {

            console.log(isExists);
            this.checkSignUpUserName = true;
            return;
          }
          else {
            this.signUpStep++;
            this.checkSignUpUserName = false;
          }
        }
      });



    }

  }

  stepper2() {
    if (this.signUpStep === 2) {
      if (!this.email?.trim() || !this.phone || !this.unitNumber?.trim()) return;
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email)) return;
      if (!/^09\d{8}$/.test(this.phone)) return;
      this.sendEmailCode()

    }
  }

  toStep2() {
    this.signUpStep = 2;
  }

  lastStep() {
    if (this.signUpStep > 1 && this.signUpStep <= 4) this.signUpStep--;
  }

  backLogin() {
    this.signUpStep = 1;
    this.booleanSignup = false;
  }

  handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filterValue(input);
  }

  onCompositionEnd(event: Event) {
    const input = event.target as HTMLInputElement;
    setTimeout(() => this.filterValue(input), 0);
  }

  private filterValue(input: HTMLInputElement) {
    const cleanValue = input.value.replace(/[^a-zA-Z0-9@.]/g, '');
    input.value = cleanValue;
    this.signUpUserName = cleanValue;
  }

  handleInput1(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filterValue1(input);
  }

  onCompositionEnd1(event: Event) {
    const input = event.target as HTMLInputElement;
    setTimeout(() => this.filterValue1(input), 0);
  }

  private filterValue1(input: HTMLInputElement) {
    const cleanValue = input.value.replace(/[^a-zA-Z0-9@.]/g, '');
    input.value = cleanValue;
    this.userName = cleanValue;
  }

  handleInput2(event: Event) {
    const input = event.target as HTMLInputElement;
    this.filterValue2(input);
  }

  onCompositionEnd2(event: Event) {
    const input = event.target as HTMLInputElement;
    setTimeout(() => this.filterValue2(input), 0);
  }

  private filterValue2(input: HTMLInputElement) {
    const cleanValue = input.value.replace(/[^a-zA-Z0-9@.]/g, '');
    input.value = cleanValue;
    this.adminAccountn = cleanValue;
  }

  toForgetPage() {
    this.router.navigate(['/forget-password']);
  }

  emailError: boolean = false; // 重複信箱錯誤
  codeError: boolean = false; // 驗證碼錯誤

  sendEmailCode() {
    this.otpControls = Array.from({ length: 6 }, () => new FormControl(''));
    this.codeError = false;
    this.auth.sendEmailcode(this.email).subscribe({
      next: () => {
        console.log('寄出驗證碼至: ' + this.email)
        this.emailError = false;
        this.signUpStep = 3;
      },
      error: (err) => {
        this.emailError = true;
        console.log(err);
      }
    });
  }

  verifyEmail(email: string, code: string) {
    this.auth.verifyEmail(email, code).subscribe({
      next: () => {
        console.log('驗證成功')
        this.signUpStep = 4;
      },
      error: (err) => {
        this.codeError = true;
        console.log(err);
      }
    });
  }

  otpControls = Array.from({ length: 6 }, () => new FormControl(''));

  onInput(event: any, index: number) {
    const value = event.target.value;

    // 只允許數字
    if (!/^[0-9]$/.test(value)) {
      this.otpControls[index].setValue('');
      return;
    }

    // 自動跳到下一格
    if (value && index < 5) {
      this.codeError = false;
      const nextInput = event.target.parentElement.children[index + 1];
      nextInput.focus();
    }

    // ⭐ 自動 submit
    const otp = this.getOtp();
    if (otp.length === 6) {
      this.verifyEmail(this.email, otp);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    // Backspace 回到上一格
    if (event.key === 'Backspace' && !this.otpControls[index].value && index > 0) {
      const prevInput = (event.target as HTMLElement).parentElement!.children[index - 1];
      (prevInput as HTMLElement).focus();
    }
  }

  onPaste(event: ClipboardEvent) {
    const pasteData = event.clipboardData?.getData('text').slice(0, 6) || '';

    if (!/^\d+$/.test(pasteData)) return;

    pasteData.split('').forEach((num, i) => {
      if (this.otpControls[i]) {
        this.otpControls[i].setValue(num);
      }
    });

    event.preventDefault();
  }

  getOtp(): string {
    return this.otpControls.map(c => c.value).join('');
  }
  checkUserName() {
    this.http.getApi("/auth/checking/userName?name=" + "this.signUpUserName").subscribe((res: any) => {
      console.log(res);
    })
  }



}
