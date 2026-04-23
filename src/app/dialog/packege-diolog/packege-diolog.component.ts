import { Component, inject, } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { HttpService } from '../../@service/http.service';
import { MatIcon } from "@angular/material/icon";
@Component({
  selector: 'app-packege-diolog',
  imports: [FormsModule, MatButtonModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, MatIcon],
  templateUrl: './packege-diolog.component.html',
  styleUrl: './packege-diolog.component.scss',
})
export class PackegeDiologComponent {

  constructor(private http: HttpService,) { }
  readonly dialogRef = inject(MatDialogRef<PackegeDiologComponent>);
  confirm() {
    this.dialogRef.close(true);
  }
}
