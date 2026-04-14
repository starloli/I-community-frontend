import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { UserResponse } from '../../interface/interface';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-resident',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  standalone: true,
  templateUrl: './edit-resident.component.html',
  styleUrl: './edit-resident.component.scss',
})
export class EditResident implements OnInit, OnDestroy {

  constructor(
    private dialog: MatDialogRef<EditResident>,
    @Inject(MAT_DIALOG_DATA) public data: UserResponse,
  ) { }

  user!: UserResponse;

  private $destroy = new Subject<void>();

  returnUser(user: UserResponse): void {
    console.log(user);
    this.dialog.close(user);
  }

  ngOnInit(): void {

    this.user = { ...this.data };

    // 如果坪數、機車位、汽車位沒有值，則預設為 0
    this.user.squareFootage = this.user.squareFootage || 0;
    this.user.motorParkingSpace = this.user.motorParkingSpace || 0;
    this.user.carParkingSpace = this.user.carParkingSpace || 0;

    console.log(this.user);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
