import { CommonModule, formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { HttpService } from '../../@service/http.service';

@Component({
  selector: 'app-bookkeeping',
  imports: [CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule, // 這裡放 Module
    MatIconModule],
  templateUrl: './bookkeeping.component.html',
  styleUrl: './bookkeeping.component.scss',
})
export class BookkeepingComponent {


selectedFile: File | null = null;


  constructor(private dialogRef: MatDialogRef<BookkeepingComponent>,private http:HttpService){}
  formData = {
    type: 'EXPENSE', // 預設支出
    amount: null,
    category: '',
    remark: '',
    transactionDate: new Date().toISOString().slice(0, 16) // 預設當前時間,

  };



onFileSelected(event: any) {
  this.selectedFile = event.target.files[0]; // 取得選取的檔案
}


expenditureType = [
  { value: 'SALARY', label: '員工薪資' },
  { value: 'REPAIR', label: '維修費 (水電、電梯、弱電)' },
  { value: 'PURCHASE', label: '採購 (辦公用品、清潔耗材)' },
  { value: 'WATER_ELEC', label: '公共水電費' },
  { value: 'CLEANING', label: '清潔外包' },
  { value: 'SECURITY', label: '保全物業費' },
  { value: 'INSURANCE', label: '保險費' },
     { value: 'PENALTY', label: '支出型罰金/違約金' },
  { value :'OTHER' ,label:'其他'}
];
 incomeType=[
    // --- 收入類 ---
     { value: 'MGMT_FEE', label: '管理費收入' },
       { value: 'FACILITY_RENTAL', label: '公設租金收入' },

          { value: 'COMMUNITY_ACT', label: '社區活動' },
                  { value: 'PENALTY', label: '收入型罰金/違約金' },
    { value: 'OTHER', label: '其他' },
 ]


NewRevenueOrExpenditure(){
  let dateStr = this.formData.transactionDate;
  if (dateStr && dateStr.length === 16) {
    // 這裡要賦值回去！並補上 :00
    dateStr = dateStr.replace('T', ' ') ;
  } else if (dateStr && dateStr.includes('T')) {
    dateStr = dateStr.replace('T', ' ');
  }
 let resultfFormData={
    type:this.formData.type,
      amount: this.formData.amount,
    category: this.formData.category,
    remark: this.formData.remark,
    transactionDate: dateStr
  }
  console.log(dateStr);



const finalPayload = new FormData();
finalPayload.append('request', new Blob([JSON.stringify(resultfFormData)], {
    type: 'application/json'
  }));
if (this.selectedFile) {
    finalPayload.append('file', this.selectedFile);
  }

this.http.postApi('/Salary/recordManualTransaction',finalPayload).subscribe({
  next:(res:any) =>{
    // console.log('成功了',res),
    this.dialogRef.close('refresh');

this.selectedFile = null;
this.formData= {
    type: 'EXPENSE', // 預設支出
    amount: null,
    category: '',
    remark: '',
    transactionDate: new Date().toISOString().slice(0, 16) // 預設當前時間
  };

  },
error: (err: any) => {
      console.log(err);
  }
})
}

}




