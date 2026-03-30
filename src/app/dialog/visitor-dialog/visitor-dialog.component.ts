import { Visitor } from './../../interface/interface';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { VisitorServiceService } from '../../@service/visitor-service.service';
@Component({
  selector: 'app-visitor-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButtonModule],
  templateUrl: './visitor-dialog.component.html',
  styleUrl: './visitor-dialog.component.scss'
})
export class VisitorDialogComponent {

  constructor(private service:VisitorServiceService){}
VisitorIdDataId!:any;
permissions!:string;

  ngOnInit(): void {
this.VisitorIdDataId=this.service.visitorId;
this.permissions=this.service.permissions;
}
}
