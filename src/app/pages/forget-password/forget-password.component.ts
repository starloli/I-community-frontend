import { Component, inject } from '@angular/core';
import { AuthService } from '../../@service/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forget-password',
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
})
export class ForgetPassword {

  private fb = inject(FormBuilder);

  email: string | null = null;
  bo: boolean = true;
  hasEmailError: boolean = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  // 寄出重製密碼的連結到信箱
  forget() {
    if (this.form.invalid) return;

    const email = this.form.value.email!;

    this.auth.forgetPassword(email).subscribe({
      next: () => {
        this.bo = false
      },
      error: (err) => {
        this.hasEmailError = true;
        console.log(err);
      }
    })
  }

  toLoginPage() {
    this.router.navigate(['/login']);
  }
}
