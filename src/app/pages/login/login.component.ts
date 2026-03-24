import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  imports: [FormsModule
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(private router : Router,private http:ApiService, private service: AuthService){}
  // 判斷是否是在注冊界面
booleanSignup=false;
//判斷使用者或者管理者
booleanIsManager:boolean=false;

// 注冊的步驟
signUpStep:number=1;

// user登錄
userName!:string;
password!:string;
//判斷是否登錄成功
userloginStatus=true;

//注冊
signUpUserName!:string;
signUpPassword:string='';
confirmPassword:string='';//確認密碼
fullName!:string;
email!:string;
phone!:string;
unitNumber!:string;

//管理者密碼賬號
adminAccountn!:string;
adminPassword!:string;
//管理者是否登錄成功
isManagerStatus=true;

// 用來追蹤使用者是否點擊過確認密碼框
isConfirmTouched = false;
isClickPhone=false;
isClickEmail=false;

//判斷密碼長度
isPasswordLength=false  ;

// icon
emailIcon='stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=mail';


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
  this.service.login(this.userName, this.password).subscribe({
    next: (res) => {
      console.log('登入成功:', res);
      this.userloginStatus=true;
      this.router.navigate(['/dashboard'])
    },
    error: (error: HttpErrorResponse) => {
      // 這裡就是獲取報錯程序碼（狀態碼）的地方
      console.log('狀態碼:', error.status);
      console.log('錯誤訊息:', error.message);
      this.userloginStatus=false;
  }});
}


//註冊api
signUpApi(){
  let signupData={
  "userName" :this.signUpUserName,
  "password":this.signUpPassword,
  "fullName":this.fullName,
  "email":this.email,
  "phone":parseInt(this.phone),
  "unitNumber":this.unitNumber,
  }
this.http.postApi("/auth/register",signupData).subscribe((res:any) =>{
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

//管理者登入api
adminLoginApi(){
  let adminAccount={
  }
  //當他輸入錯誤時
  this.isManagerStatus=false;
}







//登入狀態判斷
loginstatus(){
  this.userloginStatus=true;
}
//管理者是否登入成功
adminloginstatus(){
this.isManagerStatus=true;
}









//註冊
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
this.isManagerStatus=true;
this.userloginStatus=true;
  }




  // 步進器步驟
  Stepper1(){

  if(this.signUpStep == 1){

    if(!this.signUpUserName?.trim() || !this.signUpPassword?.trim() || !this.confirmPassword?.trim() || (this.signUpPassword.length<6 || this.signUpPassword.length>12)){

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
  // 註冊帳號輸入限制
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
  const cleanValue = input.value.replace(/[^a-zA-Z0-9@.]/g, '')

  // 強制寫回 DOM 和 Model
  input.value = cleanValue;
  this.signUpUserName = cleanValue;
}




// 使用者登入輸入的限制
handleInput1(event: Event) {
  const input = event.target as HTMLInputElement;
  this.filterValue1(input);
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
  const cleanValue = input.value.replace(/[^a-zA-Z0-9@.]/g, '')

  // 強制寫回 DOM 和 Model
  input.value = cleanValue;
  this.userName = cleanValue;
}





// 管理者輸入的限制
handleInput2(event: Event) {
  const input = event.target as HTMLInputElement;
  this.filterValue(input);
}

// 關鍵：處理中文輸入法完成後的動作
onCompositionEnd2(event: Event) {
  const input = event.target as HTMLInputElement;
  // 延遲 0 毫秒，確保在瀏覽器完成最後一次渲染後執行
  setTimeout(() => {
    this.filterValue2(input);
  }, 0);
}

private filterValue2(input: HTMLInputElement) {
  // \s 包含全形空格、半形空格
  // 如果你想連「中文字」都禁止，請用 [^\x00-\xff] 或特定的英數字正則
  const cleanValue = input.value.replace(/[^a-zA-Z0-9@.]/g, '')

  // 強制寫回 DOM 和 Model
  input.value = cleanValue;
  this.userName = cleanValue;
}
}
