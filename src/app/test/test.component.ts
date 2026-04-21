import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../@service/auth.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpService } from '../@service/http.service';

@Component({
  selector: 'app-test',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './test.component.html',
  styleUrl: './test.component.scss',
})
export class Test {

  constructor(private router: Router, private http: HttpService, private auth: AuthService) {}

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
        console.log('登入成功:', res);
        this.userloginStatus = true;

        // 儲存 token
        localStorage.setItem('token', res.accessToken);

        // 解析 JWT token 取得 role，根據角色導向不同路由
        try {
          const payload = JSON.parse(atob(res.accessToken.split('.')[1]));
          console.log('角色:', payload.role);

          if (payload.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (payload.role === 'SUPER_ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            // RESIDENT 或 GUARD
            this.router.navigate(['/resident/dashboard']);
          }
        } catch {
          // token 解析失敗，預設導向管理員
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (error: HttpErrorResponse) => {
        console.log('狀態碼:', error.status);
        console.log('錯誤訊息:', error.message);
        this.userloginStatus = false;
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
