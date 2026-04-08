import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../@service/api.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(private router: Router, private http: ApiService) {}

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

  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: any): boolean {
    if (!phone) return false;
    const phoneStr = phone.toString();
    const phoneRegex = /^09\d{8}$/;
    return phoneRegex.test(phoneStr);
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
      phone: parseInt(this.phone),
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
      this.signUpStep++;
    }
  }

  stepper2() {
    if (this.signUpStep === 2) {
      if (!this.email?.trim() || !this.phone || !this.unitNumber?.trim()) return;
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.email)) return;
      if (!/^09\d{8}$/.test(this.phone)) return;
      this.signUpStep++;
    }
  }

  lastStep() {
    if (this.signUpStep > 1 && this.signUpStep <= 3) this.signUpStep--;
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
}
