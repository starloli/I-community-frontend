import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HttpService } from '../../../@service/http.service';

@Component({
  selector: 'app-dept',
  imports: [FormsModule,MatIconModule],
  templateUrl: './dept.component.html',
  styleUrl: './dept.component.scss',
})
export class DeptComponent {


constructor(private http: HttpService){}

mockDepartments:any[]=[];
ngOnInit(): void {
this.getAllDept();
}

getAllDept(){
  this.http.getApi("/Salary/getDepartment").subscribe({

    next:(data:any)=>{
      console.log(data);
      this.mockDepartments=data;
    },error:(res:any)=>{
      console.log('error:'+ res);

    }
  })
}

// 在 Component 類別中定義假資料


// 初始化表單物件
newDept = {
  name: '',
  description: ''
};

onSubmit() {
  console.log('提交的數據：', this.newDept);
  // 這裡之後會接你寫好的 Service
}
}
