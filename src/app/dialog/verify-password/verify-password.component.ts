import { Router } from '@angular/router';
import { Component } from '@angular/core'
import { HttpService } from '../../@service/http.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { FormsModule } from '@angular/forms'
import { ToastService } from '../../@service/toast.service'

@Component({
  selector: 'app-verify-password',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './verify-password.component.html',
  styleUrl: './verify-password.component.scss',
})
export class VerifyPasswordComponent {
  constructor(
    private http: HttpService,
    private dialogRef: MatDialogRef<VerifyPasswordComponent>,
    private toast: ToastService,
    private router: Router
  ) { }
  password = ''
  postUrl = '/modify/superadmin/verify-password'

  verifyPassword(password?: string) {
    if (password !== '' && password !== undefined) {
      this.http.postApi(this.postUrl, { password }).subscribe({
        next: (res) => {
          console.log("res：", res)
          // if (res) {
          //   this.dialogRef.close(true);
          // }
          this.toast.success('驗證成功', 2000);
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error("err：", err)
          if (err.error.message === "密碼不正確") {
            this.toast.error('密碼不正確', 2000);
          }
        }
      })
    } else {
      this.router.navigate(['/admin/dashboard']);
      this.dialogRef.close(false);
    }
  }
}
