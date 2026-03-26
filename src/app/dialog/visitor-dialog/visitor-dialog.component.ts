import { CommonModule } from '@angular/common';
import { Component, Inject, Optional } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';

import { VisitorServiceService } from '../../@service/visitor-service.service';

interface VisitorDialogData {
  visitor?: any;
  permissions?: string;
}

@Component({
  selector: 'app-visitor-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule, MatIconModule,],
  templateUrl: './visitor-dialog.component.html',
  styleUrl: './visitor-dialog.component.scss'
})
export class VisitorDialogComponent {
  visitorData: any = null;
  permissions = 'admin';

  constructor(
    private service: VisitorServiceService,
    private dialogRef: MatDialogRef<VisitorDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private data: VisitorDialogData | null
  ) {}

  ngOnInit(): void {
    this.visitorData = this.data?.visitor ?? this.service.visitorId ?? null;
    this.permissions = this.data?.permissions ?? this.service.permissions ?? 'admin';
  }


  closeDialog() {
    this.dialogRef.close();
  }
}
