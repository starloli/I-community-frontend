import { Injectable, OnDestroy, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VerifyPasswordComponent } from '../dialog/verify-password/verify-password.component';

@Injectable({
  providedIn: 'root',
})
export class SuperAdminService implements OnDestroy {

  constructor(private dialog: MatDialog) { }

  isVerified = signal(false);

  setVerified(value: boolean) {
    this.isVerified.set(value);
  }

  ngOnDestroy(): void {
    this.isVerified.set(false);
  }
}
