import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../@service/auth.service';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.scss',
})
export class ResetPassword {

  private fb = inject(FormBuilder);

  token: string | null = null;

  form = this.fb.group({
    username: [''],
    npw: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(12)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {}

  // 密碼一致驗證
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const pw = control.get('npw')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return pw === confirm ? null : { mismatch: true };
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
    console.log('token:', this.token);
  }

  // 送出新密碼
  reset() {
    if (this.form.invalid || !this.token) return;

    const npw = this.form.value.npw!;

    this.auth.resetPassword(this.token, npw).subscribe(res => {
      console.log(res)
      this.router.navigate(['/login']);
    });
  }
}
