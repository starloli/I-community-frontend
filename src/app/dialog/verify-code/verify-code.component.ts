import { SuperAdminService } from './../../@service/super-admin.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core'
import { HttpService } from '../../@service/http.service'
import { MatDialogRef } from '@angular/material/dialog'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { takeUntil } from 'rxjs';
import { AuthService } from '../../@service/auth.service';

@Component({
  selector: 'app-verify-password',
  imports: [FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './verify-code.component.html',
  styleUrl: './verify-code.component.scss',
})
export class VerifyCodeComponent {

  constructor(
    private http: HttpService,
    private dialogRef: MatDialogRef<VerifyCodeComponent>,
    private snackBar: MatSnackBar,
    private router: Router,
    private authService: AuthService,
    private superAdminService: SuperAdminService
  ) { }

  otpCtrl = Array.from({ length: 6 }, () => new FormControl(''));
  sendVerifyUrl = '/modify/superadmin/send-verify-code';
  verifyUrl = '/auth/email/verify';
  nextStep = false;
  emailVerified = false;
  emailCodeExpiry = 0;

  sendVerifyCode() {

    this.nextStep = true;
  }


  verifyCode(code: Array<FormControl>) {
    for (let i = 0; i < this.otpCtrl.length; i++) {

    }
    this.dialogRef.close(true);
  }

  postCode(code: string) {
    this.http.postApi(this.verifyUrl, { code }).subscribe({
      next: (res) => {
        console.log("res：", res)
        // if (res) {
        //   this.dialogRef.close(true);
        // }
        this.snackBar.open("驗證成功", "關閉", {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error("err：", err)
        if (err.error.message === "密碼不正確") {
          this.snackBar.open("密碼不正確", "關閉", {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
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
}

interface EmailVerifyRequest {
  email: string;
  code: string;
}
