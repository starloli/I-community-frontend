import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../@service/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserResponse } from '../../../interface/interface';
import { MatDialog } from '@angular/material/dialog';
import { EditResident } from '../../../dialog/edit-resident/edit-resident.component';

@Component({
  selector: 'app-modify-resident',
  imports: [],
  templateUrl: './modify-resident.html',
  styleUrl: './modify-resident.scss',
})
export class ModifyResident implements OnInit, OnDestroy {

  constructor(private http: HttpService, private snackBar: MatSnackBar, private dialog: MatDialog) { }

  getUrl = 'http://localhost:8083/admin/get-all-residents-users';
  postUrl = 'http://localhost:8083/modify/admin';
  users: UserResponse[] = [];

  private $destroy = new Subject<void>();

  editUser(user: UserResponse): void {
    const dialogRef = this.dialog.open(EditResident, {
      data: user
    });

    dialogRef.afterClosed().pipe(takeUntil(this.$destroy)).subscribe(result => {
      if (result) {
        this.updateUser(result);
        this.getUser();
      }
    });
  }

  ngOnInit(): void {
    this.getUser();
  }

  getUser(): void {
    this.http.getApi<UserResponse[]>(this.getUrl).pipe(takeUntil(this.$destroy)).subscribe({
      next: (res) => {
        this.users = res;
      },
      error: (err) => {
        this.snackBar.open(err.message || '載入住戶資料失敗', '關閉', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        console.log(err);
      }
    });
  }

  updateUser(user: UserResponse): void {
    this.http.putApi(this.postUrl, user).pipe(takeUntil(this.$destroy)).subscribe({
      next: (res) => {
        this.snackBar.open('使用者資料更新成功', '關閉', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.getUser();
      },
      error: (err) => {
        this.snackBar.open(err.message || '使用者資料更新失敗', '關閉', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        console.log(err);
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
