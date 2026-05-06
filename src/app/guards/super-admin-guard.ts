import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { SuperAdminService } from '../@service/super-admin.service';
import { MatDialog } from '@angular/material/dialog';
import { VerifyCodeComponent } from '../dialog/verify-code/verify-code.component';
import { map } from 'rxjs';

export const superAdminGuard: CanActivateFn = (route, state) => {

  const dialog = inject(MatDialog);
  const superAdminService = inject(SuperAdminService);

  if (superAdminService.isVerified()) {
    return true;
  }

  const dialogRef = dialog.open(VerifyCodeComponent);

  return dialogRef.afterClosed().pipe(
    map(res => {
      if (res) {
        superAdminService.setVerified(true);
        return true;
      } else {
        return false;
      }
    })
  )
};
