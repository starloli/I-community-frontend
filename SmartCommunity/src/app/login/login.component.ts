import {Component, inject} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {FormBuilder, Validators, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatStepperModule} from '@angular/material/stepper';
import {MatButtonModule} from '@angular/material/button';


@Component({
  selector: 'app-login',
  imports: [RouterLink,
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(private router : Router){}
  // 判斷是否是在注冊界面
booleanSignup=false;
//判斷使用者或者管理者
booleanIsManager:boolean=false;

// 注冊的步驟
signUpStep:number=1;



//注冊
  sign_up(){
this.booleanSignup=!this.booleanSignup;
  }

  //切換使用者/管理者
  switchUser(){
    this.booleanIsManager=!this.booleanIsManager;
  }

  // 步進器步驟
  Stepper(){
if(this.signUpStep>=1&&this.signUpStep<3){this.signUpStep++}
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

}
