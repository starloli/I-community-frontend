import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { HttpService } from '../../../@service/http.service';

@Component({
  selector: 'app-financial-dashboard',
  imports: [CommonModule],
  templateUrl: './financial-dashboard.component.html',
  styleUrl: './financial-dashboard.component.scss',
})
export class FinancialDashboardComponent {

  constructor(private http:HttpService){}

  // 資料儲存
  transactions: any[] = [];

  // 統計數值
  totalBalance: number = 0;
  totalIncome: number = 0;
  totalExpense: number = 0;

  ngOnInit() {
    this.fetchFinancialData();
  }

  fetchFinancialData() {
    this.http.getApi('/Salary/summary/total')
      .subscribe({
        next: (data:any) => {
          console.log(data);

   this.totalBalance=data.balance,
   this.totalIncome=data.totalIncome,
   this.totalExpense=data.totalExpense
this.fetchDashboardFinancialData()
        },
        error: (err:any) => console.error('API 讀取失敗:', err)
      });
  }

fetchDashboardFinancialData(){
  this.http.getApi('/Salary/summary/now').subscribe({
    next:(res:any)=>{
      console.log(res);
this.transactions=res
    },

    error(err:any) {
   console.error('API 讀取失敗:', err)

    },
  })
}

}
