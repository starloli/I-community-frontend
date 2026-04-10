import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from '../../../@service/http.service';
import { UserResponse } from '../../../interface/interface';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-info',
  imports: [FormsModule],
  templateUrl: './user-info.html',
  styleUrl: './user-info.scss',
})
export class UserInfo implements OnInit, OnDestroy {

  constructor(private http: HttpService, private snackBar: MatSnackBar) { }

  getUrl = "http://localhost:8083/user/me";
  modifyUrl = "http://localhost:8083/modify/admin";
  user!: UserResponse;
  updateUser!: UserResponse;
  private $destroy = new Subject<void>();

  ngOnInit(): void {
    this.getInfo();
  }

  getInfo(): void {
    this.http.getApi<UserResponse>(this.getUrl).pipe(takeUntil(this.$destroy)).subscribe({
      next: (response) => {
        this.user = response;
        this.updateUser = { ...response };
        console.log(this.user);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  ModifyResident(): void {
    if (this.isValid(this.updateUser)) {
      this.http.putApi(this.modifyUrl, this.updateUser).pipe(takeUntil(this.$destroy)).subscribe({
        next: (response) => {
          this.snackBar.open('修改成功', '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          })
          console.log(response);
          this.getInfo();
        },
        error: (error) => {
          this.snackBar.open('修改失敗', '關閉', {
            duration: 2000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          })
          console.error(error);
        }
      })
    }
  }

  No(): void {
    this.snackBar.open('NO', 'NO', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    })
  }

  isValid(user: UserResponse): boolean {
    return !user;
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneStr = phone.toString();
    const phoneRegex = /^09\d{8}$/;
    return phoneRegex.test(phoneStr);
    if (!phone) return false;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
