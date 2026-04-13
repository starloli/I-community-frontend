import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { UserResponse } from '../../interface/interface';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-resident',
  imports: [FormsModule],
  standalone: true,
  templateUrl: './edit-resident.html',
  styleUrl: './edit-resident.scss',
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
    console.log(this.user);
  }

  ngOnDestroy(): void {
    this.$destroy.next();
    this.$destroy.complete();
  }
}
