import { Injectable, OnDestroy, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root',
})
export class SuperAdminService implements OnDestroy {

  constructor(private dialog: MatDialog) { }

  userEmail = signal('');
  isVerified = signal(false);

  setUserEmail(email: string) {
    this.userEmail.set(email);
  }

  getUserEmail() {
    return this.userEmail();
  }

  setVerified(value: boolean) {
    this.isVerified.set(value);
  }

  ngOnDestroy(): void {
    this.isVerified.set(false);
  }
}
