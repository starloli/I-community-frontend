import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../@service/http.service';
import { UserResponse } from '../../../interface/interface';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-user-info',
  imports: [FormsModule],
  templateUrl: './user-info.html',
  styleUrl: './user-info.scss',
})
export class UserInfo implements OnInit, OnDestroy {

  constructor(private http: HttpService, private snackBar: MatSnackBar) { }

  getUrl = "/user/me";
  modifyUrl = "/modify/myself";
  user!: UserResponse;
  userEmail!: string;
  userPhone!: string;
  private $destroy = new Subject<void>();

  ngOnInit(): void {
    this.getInfo();
  }

  getInfo(): void {
    this.http.getApi<UserResponse>(this.getUrl).pipe(takeUntil(this.$destroy)).subscribe({
      next: (response) => {
        this.user = response;
        this.userEmail = this.user.email;
        this.userPhone = this.user.phone;
        console.log(this.user);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  ModifyResident(): void {
    if (this.isValidEmail(this.userEmail) && this.isValidPhone(this.userPhone)) {
      this.http.putApi(this.modifyUrl,{
        email: this.userEmail,
        phone: this.userPhone
      }).pipe(takeUntil(this.$destroy)).subscribe({
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


  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    if (!phone) return false;
    const phoneStr = phone.toString();
    const phoneRegex = /^09\d{8}$/;
    return phoneRegex.test(phoneStr);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
