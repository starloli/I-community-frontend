import { Component, Inject, OnDestroy, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { Subject } from 'rxjs'
import { UserResponse } from '../../interface/interface'
import { FormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { UserRole, UserStatus } from '../../interface/enum'
import { MatOptionModule } from '@angular/material/core'
import { MatSelectModule } from '@angular/material/select'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'

@Component({
  selector: 'app-edit-user',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  standalone: true,
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss',
})
export class EditUserComponent implements OnInit, OnDestroy {

  constructor(
    private dialog: MatDialogRef<EditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserResponse,
  ) { }

  user!: UserResponse
  roles = [UserRole.ADMIN, UserRole.RESIDENT]

  private $destroy = new Subject<void>()

  get isUserActive(): boolean {
    return this.user.status === UserStatus.ACTIVE;
  }

  set isUserActive(value: boolean) {
    this.user.status = value ? UserStatus.ACTIVE : UserStatus.INACTIVE;
  }


  returnUser(user: UserResponse): void {
    // console.log(user);
    if (this.validNumber(user.squareFootage) && this.validNumber(user.motorParkingSpace) && this.validNumber(user.carParkingSpace)) {
      this.dialog.close(user);
    }else{
      alert('坪數、機車位、汽車位必須為非負數');
    }
  }

  ngOnInit(): void {

    console.log(this.data)

    this.user = { ...this.data }

    // 如果坪數、機車位、汽車位沒有值，則預設為 0
    this.user.squareFootage = this.user.squareFootage || 0
    this.user.motorParkingSpace = this.user.motorParkingSpace || 0
    this.user.carParkingSpace = this.user.carParkingSpace || 0

  }

  validNumber(value:number): boolean {
    return value >= 0
  }

  ngOnDestroy(): void {
    this.$destroy.next()
    this.$destroy.complete()
  }
}

