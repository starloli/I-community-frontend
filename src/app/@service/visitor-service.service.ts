

import { Injectable } from '@angular/core';
import { VisitorComponent } from '../pages/visitor/visitor.component';
import { VisitorDialogComponent } from '../dialog/visitor-dialog/visitor-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class VisitorServiceService {

  constructor() { }

//得到點擊該住戶的全部信息
  visitorId!:any;

  //得到是哪裏裏來的
  permissions!:string;
}
