import { Router } from '@angular/router';
import { Component } from '@angular/core'
import { HttpService } from '../../@service/http.service'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import { FormsModule } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'

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
    private snackBar: MatSnackBar,
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
    } else {
      this.router.navigate(['/admin/dashboard']);
      this.dialogRef.close(false);
    }
  }
}
