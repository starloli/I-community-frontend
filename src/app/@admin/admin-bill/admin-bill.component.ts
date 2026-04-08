import { Component } from '@angular/core';
import { HttpService } from '../../@service/http.service';
import { ApiService } from '../../services/api.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-admin-bill',
  imports: [FormsModule],
  templateUrl: './admin-bill.component.html',
  styleUrl: './admin-bill.component.scss'
})
export class AdminBillComponent {

constructor(private http:ApiService){}


//1.先得到住戶信息 ,2 依據每個住戶的情況產生管理費用
booleanSendBill=false;

addressList!:any;
unitNumber!:string;
billingMonth!:string;
dueDate!:string;
remark!:string;
//使用者個人水費
myWater:number =0;
//使用者個人電費
myElectricity:number=0;

managementfee:number=0
car_parkkingcleaningfee:number=0;
locomotive_parkkingcleaningfee:number=0
otherexpenses:number=0
title!:String;

//每平方管理費
managementFeePerSquareMeter!:number;
//住戶的平方數
squareFootage!:number;
//管理者制定的機車車位情節費
adminCar_parkkingcleaningfee!:number;
//管理者制定的汽車車位清潔費
adminLocomotive_parkkingcleaningfee!:number;
//user的摩頭車車位數量
userLocomotiveNumber!:number;
// user的汽車車位數量
userCarNumber!:number;
//水費
water:number=0
//電費
electricity:number=0;
//得到全部住戶數量
getAllAdressNumber!:number;

//判斷該住戶本期是否發送過賬單
booleanThisUnitnumberSendBill=false;
ngOnInit(): void {
  this.getAllAdress();
}

sendBill(){
  this.booleanSendBill=!this.booleanSendBill;
}

getAllAdress(){
  this.http.getApi("/visitor/allAddresses").subscribe((res:any)=>{
    this.addressList = res.sort();
    this.getAllAdressNumber=res.length;


    console.log(this.addressList);
  })
}

sendBillToUnitNumber(){
let sendData={
  "unitNumber":this.unitNumber,
  "billingMonth":this.billingMonth,
  "dueDate":this.dueDate,
  "remark":this.remark,
  "title":this.title,
  "fees":{
    "WATER":this.myWater,
    "ELECTRICITY":this.myElectricity,
    "MANAGEMENTFEE":this.managementfee,
    "CARPARKINGCLEANINGFEE":this.car_parkkingcleaningfee,
    "LOCOMOTIVE_PARKINGCLEANINGFEE":this.locomotive_parkkingcleaningfee,
"OTHEREXPENSES":this.otherexpenses
  }
}
console.log(sendData);

//發送賬單
  this.http.postApi("/bills/toUnitNumber",sendData).subscribe({next:(res:any)=>{
    console.log("成功");
    console.log(sendData);
console.log(res);

    },
    error:(res :any)=>{
      console.log(res);
console.log("本月該住戶已經有賬單了,不能重複發送");

    }
  })
}

//通過下拉式選單得到住戶信息
getAdressData(){
const encodedUnitNumber = encodeURIComponent(this.unitNumber);
  this.http.getApi(`/bills/details?unitNumber=${encodedUnitNumber}`).subscribe({next:(res :any)=>{
    console.log(res);


    this.squareFootage=res.squareFootage;
    //使用者摩托車車位數量
    this.userLocomotiveNumber=res.motorParkingSpace;
    //使用者汽車車位數量
    this.userCarNumber=res.carParkingSpace;


this.calculateFee(); // 拿到面積後計算

this.getSendBills();
      },
error:(res)=>{console.log("沒有這個住戶");
}
    })
}

//得到本期已經繳費過的項目
getSendBills(){
   this.http.getApi("/bills/sent-list?unitNumber="+ this.unitNumber+"&billingMonth=" +this.billingMonth).subscribe((data:any)=>{
      console.log(data);
      //判斷裏面有沒有資料,有的話説明本期已經發送過帳單
      if(data.length>0){
this.booleanThisUnitnumberSendBill=true;}
     })
    }

//得到我的賬單資料
getMyBill(){
  this.http.getApi("/bills/getMyBill").subscribe((res:any)=>{
    console.log(res);
  })
}

//計算管理費
calculateFee() {
  if (this.squareFootage && this.managementFeePerSquareMeter) {
    this.managementfee = this.squareFootage * this.managementFeePerSquareMeter;
  }
  if(this.userLocomotiveNumber){
    this.locomotive_parkkingcleaningfee=this.userLocomotiveNumber *this.adminLocomotive_parkkingcleaningfee;
  }
  if(this.userCarNumber){
    this.car_parkkingcleaningfee=this.userCarNumber * this.adminCar_parkkingcleaningfee;
  }
  if(this.water){
this.myWater= this.water /this.getAllAdressNumber;
  }
  if(this.electricity){
    this.myElectricity=this.electricity /this.getAllAdressNumber;
  }
}

}
