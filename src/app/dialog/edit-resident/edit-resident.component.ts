import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { UserResponse } from '../../interface/interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
export class EditResidentComponent implements OnInit, OnDestroy {

  constructor(
    private dialog: MatDialogRef<EditResidentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserResponse,
  ) { }

  user!: UserResponse;

  private $destroy = new Subject<void>();

  // TODO:社區行事曆功能，讓住戶可以看到社區活動資訊

  returnUser(user: UserResponse): void {
    // console.log(user);
    if (this.validNumber(user.squareFootage) && this.validNumber(user.motorParkingSpace) && this.validNumber(user.carParkingSpace)) {
      this.dialog.close(user);
    }else{
      alert('坪數、機車位、汽車位必須為非負數');
    }
  }

  ngOnInit(): void {

    this.user = { ...this.data };

    // 如果坪數、機車位、汽車位沒有值，則預設為 0
    this.user.squareFootage = this.user.squareFootage || 0;
    this.user.motorParkingSpace = this.user.motorParkingSpace || 0;
    this.user.carParkingSpace = this.user.carParkingSpace || 0;

  }

  validNumber(value:number): boolean {
    return value >= 0;
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
