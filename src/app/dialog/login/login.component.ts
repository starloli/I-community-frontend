import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogTitle, MatDialogActions, MatDialogContent, MatDialogClose } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpServiceService } from '../../@service/http-service.service';

@Component({
  selector: 'app-login',
  imports: [MatDialogTitle, MatDialogActions, MatDialogContent, MatDialogClose, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(private dialogRef: MatDialogRef<LoginComponent>, private snackBar: MatSnackBar, private httpService: HttpServiceService) { }

  registerUrl = 'http://localhost:8083/auth/register';
  loginUrl = 'http://localhost:8083/auth/login';

  user: user = {
    userName: '',
    email: '',
    phone: -1,
    password: '',
    fullName: '',
    unitNumber: ''
  };

  returnUser(): void {
    if (this.user.userName !== '' &&
      this.user.password !== '') {
      this.httpService.postApi<loginToken>(this.loginUrl, this.user)
        .subscribe((res: loginToken) => {
          this.user.token = res.accessToken;
          console.log(this.user);
          this.dialogRef.close(this.user);
        });
    } else {
      this.snackBar.open(('請輸入' +
        (this.user.userName === '' ? '帳號' :
          this.user.password === '' ? '密碼' :
            ''
        )),
        '關閉',
        {
          duration: 1500,
          verticalPosition: 'top',
          horizontalPosition: 'center'
        }
      );
    }
  }

  registerUser(user: user): void {
    this.httpService.postApi<user>(this.registerUrl, user)
      .subscribe((res: any) => {
        this.dialogRef.close(res);
      });
  }
}
