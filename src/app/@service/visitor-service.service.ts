

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VisitorServiceService {

  constructor() { }

//得到點擊該住戶的全部信息
  visitorId!:any;

  //得到是哪裏裏來的
  permissions!:string;




  //下面是賬單的service
  myBillId!:any;
}
