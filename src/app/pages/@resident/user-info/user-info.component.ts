import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../@service/http.service';
import { UserResponse } from '../../../interface/interface';
import { FormsModule } from "@angular/forms";
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastService } from '../../../@service/toast.service';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
})
export class UserInfoComponent implements OnInit, OnDestroy {

  constructor(private http: HttpService, private toast: ToastService) { }

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
      this.http.putApi(this.modifyUrl, {
        email: this.userEmail,
        phone: this.userPhone
      }).pipe(takeUntil(this.$destroy)).subscribe({
        next: (response) => {
          this.toast.success('修改成功', 2000)
          console.log(response);
          this.getInfo();
        },
        error: (error) => {
          this.toast.error('修改失敗', 2000)
          console.error(error);
        }
      })
    }
  }

  No(): void {
    this.toast.info('NO', 2000)
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
