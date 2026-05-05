

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

booleanOpenDialog!:string;

//傳遞圖片的路徑  從financial-dashboard來的
image!:string;

//現在的角色
role!:string;
}
