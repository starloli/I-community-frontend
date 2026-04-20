import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../@service/http.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UserResponse } from '../../../interface/interface';

@Component({
  selector: 'app-modify-resident',
  imports: [],
  templateUrl: './modify-resident.component.html',
  styleUrl: './modify-resident.component.scss',
})
export class ModifyResident implements OnInit, OnDestroy {

  constructor(private http: HttpService, private snackBar: MatSnackBar) { }

  getUrl = 'http://localhost:8083/admin/get-all-residents-users';
  postUrl = 'http://localhost:8083/admin/update-user';
  users : UserResponse[] = [];

  private $destroy = new Subject<void>();

  ngOnInit(): void {
    this.http.getApi<UserResponse[]>(this.getUrl).pipe(takeUntil(this.$destroy)).subscribe({
      next: (res) => {
        this.users = res;
        console.log(this.users);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
