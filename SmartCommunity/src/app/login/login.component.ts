import {Component, inject} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';
import { ServiceService } from '../@api/service.service';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-login',
  imports: [RouterLink,FormsModule
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(private router : Router,private http:ServiceService){}
  // 判斷是否是在注冊界面
booleanSignup=false;
//判斷使用者或者管理者
booleanIsManager:boolean=false;

// 注冊的步驟
signUpStep:number=1;

// user登錄
userName!:string;
password!:string;

//注冊
signUpUserName!:string;
signUpPassword!:string;
confirmPassword!:string;//確認密碼
fullName!:string;
email!:string;
phone!:string;
unitNumber!:string;

//管理者密碼賬號
adminAccountn!:string;
adminPassword!:string;

// 用來追蹤使用者是否點擊過確認密碼框
isConfirmTouched = false;
isClickPhone=false;
isClickEmail=false;
//判斷email和phone格式
isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// 驗證電話格式（以台灣 10 位數為例，可依需求調整）
isValidPhone(phone: any): boolean {
  if (!phone) return false;
  const phoneStr = phone.toString();
  const phoneRegex = /^09\d{8}$/; // 檢查是否為 09 開頭的 10 位數字
  return phoneRegex.test(phoneStr);
}
//登錄api
useLoginApi(){
let LoginAccount =  {
    "userName": this.userName,
    "password": this.password
}
console.log(LoginAccount);

this.http.postApi("http://localhost:8083/auth/login",LoginAccount).subscribe({
  next: (res) => {
    console.log('成功:', res);
  },
  error: (error: HttpErrorResponse) => {
    // 這裡就是獲取報錯程序碼（狀態碼）的地方
    console.log('狀態碼:', error.status);
    console.log('錯誤訊息:', error.message);


  }
});}


//注冊api
signUpApi(){
  let signupData={
  "userName" :this.signUpUserName,
  "password":this.signUpPassword,
  "fullName":this.fullName,
  "email":this.email,
  "phone":parseInt(this.phone),
  "unitNumber":this.unitNumber,
  }
this.http.postApi("http://localhost:8083/auth/register",signupData).subscribe((res:any) =>{
  console.log(res);
  console.log("成功");
  this.signUpUserName="";
  this.signUpPassword="";
  this.confirmPassword="";
  this.fullName="";
  this.email="";
  this.unitNumber="";
this.backLogin();
})
}

//管理者登錄api
adminLoginApi(){
  let adminAccount={

  }
}



//注冊
  sign_up(){
this.booleanSignup=!this.booleanSignup;
  }

  //切換使用者/管理者
  switchUser(){
    this.booleanIsManager=!this.booleanIsManager;
    this.userName='';
    this.password='';
this.adminAccountn='';
this.adminPassword='';
  }




  // 步進器步驟
  Stepper1(){

  if(this.signUpStep == 1){

    if(!this.signUpUserName?.trim() || !this.signUpPassword?.trim() || !this.confirmPassword?.trim()){

      return;
    }

    if(this.signUpPassword !== this.confirmPassword){

      return;
    }

    this.signUpStep++;

  }}
  stepper2(){
if(this.signUpStep==2){
  if(!this.email?.trim() || !this.phone || !this.unitNumber?.trim()){
    return;
  }
  let emailFormat:RegExp=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if(!emailFormat.test(this.email)){
    return;
  }
  let phoneFormat:RegExp=/^09\d{8}$/;;
  if(!phoneFormat.test(this.phone)){
return;
  }

  this.signUpStep++}
  }



lastStep(){
  if(this.signUpStep>1&&this.signUpStep<=3){
this.signUpStep--;
  }
}
  // 返回登錄(初始化步進器)
  backLogin(){
    this.signUpStep=1;
    this.booleanSignup=false;

  }
handleInput(event: Event) {
  const input = event.target as HTMLInputElement;
  this.filterValue(input);
}

// 關鍵：處理中文輸入法完成後的動作
onCompositionEnd(event: Event) {
  const input = event.target as HTMLInputElement;
  // 延遲 0 毫秒，確保在瀏覽器完成最後一次渲染後執行
  setTimeout(() => {
    this.filterValue(input);
  }, 0);
}

private filterValue(input: HTMLInputElement) {
  // \s 包含全形空格、半形空格
  // 如果你想連「中文字」都禁止，請用 [^\x00-\xff] 或特定的英數字正則
  const cleanValue = input.value.replace(/[^a-zA-Z0-9]/g, '')

  // 強制寫回 DOM 和 Model
  input.value = cleanValue;
  this.signUpUserName = cleanValue;
}





handleInput1(event: Event) {
  const input = event.target as HTMLInputElement;
  this.filterValue(input);
}

// 關鍵：處理中文輸入法完成後的動作
onCompositionEnd1(event: Event) {
  const input = event.target as HTMLInputElement;
  // 延遲 0 毫秒，確保在瀏覽器完成最後一次渲染後執行
  setTimeout(() => {
    this.filterValue1(input);
  }, 0);
}

private filterValue1(input: HTMLInputElement) {
  // \s 包含全形空格、半形空格
  // 如果你想連「中文字」都禁止，請用 [^\x00-\xff] 或特定的英數字正則
  const cleanValue = input.value.replace(/[^a-zA-Z0-9]/g, '')

  // 強制寫回 DOM 和 Model
  input.value = cleanValue;
  this.userName = cleanValue;
}






handleInput2(event: Event) {
  const input = event.target as HTMLInputElement;
  this.filterValue(input);
}

// 關鍵：處理中文輸入法完成後的動作
onCompositionEnd2(event: Event) {
  const input = event.target as HTMLInputElement;
  // 延遲 0 毫秒，確保在瀏覽器完成最後一次渲染後執行
  setTimeout(() => {
    this.filterValue1(input);
  }, 0);
}

private filterValue2(input: HTMLInputElement) {
  // \s 包含全形空格、半形空格
  // 如果你想連「中文字」都禁止，請用 [^\x00-\xff] 或特定的英數字正則
  const cleanValue = input.value.replace(/[^a-zA-Z0-9]/g, '')

  // 強制寫回 DOM 和 Model
  input.value = cleanValue;
  this.userName = cleanValue;
}
}
