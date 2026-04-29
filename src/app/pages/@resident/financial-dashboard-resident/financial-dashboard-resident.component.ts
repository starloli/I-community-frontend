import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HttpService } from '../../../@service/http.service';
import Chart from 'chart.js/auto';

import { MatIconModule } from '@angular/material/icon';
import { yearsToMonths } from 'date-fns';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { BookkeepingComponent } from '../../../dialog/bookkeeping/bookkeeping.component';

@Component({
  selector: 'app-financial-dashboard-resident',
  imports: [MatIconModule, CommonModule, MatDialogModule, CommonModule, FormsModule, MatPaginatorModule, MatButtonModule,FormsModule],
  templateUrl: './financial-dashboard-resident.component.html',
  styleUrl: './financial-dashboard-resident.component.scss',
})
export class FinancialDashboardResidentComponent {

  constructor(private http:HttpService){}

  // 資料儲存
  transactions: any[] = [];

  // 統計數值
  totalBalance: number = 0;
  totalIncome: number = 0;
  totalExpense: number = 0;


  monthsummary :number[]=[];
  monthIncome:number[]=[];
  monthExpense:number []=[];


  month:string='';

  myLineChart: any;
  myBarChart: any;
// --- 1. 定義變數 ---
p: number = 1;              // 當前頁碼 (從1開始較直覺)
itemsPerPage: number = 7;  // 每頁顯示 10 筆

displayTransactions: any[] = []; // 存放「當前頁面」要顯示的資料

  ngOnInit() {
    this.fetchFinancialData();

    this.getMonth();

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


goToPage(page: number) {
  // 分頁要從 filteredTransactions 取資料，不然搜尋後分頁會壞掉
  if (page < 1 || (this.totalPages > 0 && page > this.totalPages)) return;

  this.p = page;
  const startIndex = (page - 1) * this.itemsPerPage;
  const endIndex = startIndex + this.itemsPerPage;

  this.displayTransactions = this.filteredTransactions.slice(startIndex, endIndex);
}



linechart(){
  // 獲取 canvas 元素
let ctx = document.getElementById('chart') as HTMLCanvasElement;
if (this.myLineChart) {
    this.myLineChart.destroy();
  }
// 設定數據
let data = {
  // x 軸文字
  labels: ['1月', '2月', '3月', '4月', '5月', '6月','7月', '8月', '9月', '10月', '11月', '12月'],
  datasets: [
    // 第一組資料
    {
      // 上方分類文字
      label: '月盈餘',
      // 數據
      data: this.monthsummary,
      // 線與邊框顏色
      borderColor: 'rgba(75, 192, 192, 1)',
      // 線下方是否要填滿
      fill: true,
      // 線的弧度(0-1)，數值愈小線愈直
      tension: 0.1,
    },
  ],
};
this.myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
  });


}




getMonth(){
      let date=new Date();

  this.http.getApi("/Salary/summary/"+date.getFullYear()).subscribe((res:any)=>{
    this.monthsummary=res.map((item:any) => item.balance);
    this.monthIncome=res.map((income:any)=>income.totalIncome);
    this.monthExpense=res.map((expense:any)=>expense.totalExpense);
        // console.log(this.monthsummary);
    this.linechart();
    this.barChart();
  })
}



barChart(){
//  / / 獲取 canvas 元素
let ctx = document.getElementById('barChart') as HTMLCanvasElement;
if (this.myBarChart) {
    this.myBarChart.destroy();
  }
// 設定數據
let data = {
  // x 軸文字
  labels: ['1月', '2月', '3月', '4月', '5月', '6月','7月', '8月', '9月', '10月', '11月', '12月'],
  datasets: [
    // 第一組資料
    {
      // 上方分類文字
      label: '月收入',
      // 數據
      data: this.monthIncome,
      // 顏色
   backgroundColor: 'rgba(34, 197, 94, 0.5)', // 翠綠
    borderColor: 'rgb(34, 197, 94)',
      // 邊框寬度
      borderWidth: 1,
    },
      {
      // 上方分類文字
      label: '月支出',
      // 數據
      data: this.monthExpense,
      // 顏色
  backgroundColor: 'rgba(239, 68, 68, 0.5)', // 亮紅
    borderColor: 'rgb(239, 68, 68)',
      // 邊框寬度
      borderWidth: 1,
    },
  ],
};

// 圖表選項
var options = {
  scales: {
    y: {
      // y 軸從 0 開始
      beginAtZero: true,
    },
  },
};
this.myBarChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options,
  });


}






applyFilters() {
  // A. 如果沒有搜尋關鍵字，就直接等於原始資料
  if (!this.searchTerm.trim()) {
    this.filteredTransactions = [...this.transactions];
  } else {
    // B. 有關鍵字就進行篩選
    const term = this.searchTerm.toLowerCase();
    this.filteredTransactions = this.transactions.filter(item =>
      item.category?.toLowerCase().includes(term) ||
      item.remark?.toLowerCase().includes(term)
    );
  }

  // C. 篩選完後，一定要跳回第 1 頁並切分資料
  this.goToPage(1);
}





// --- 1. 新增篩選變數 ---

searchTerm: string = '';
filteredTransactions: any[] = []; // 存放過濾後的結果

//API 拿回資料後
fetchDashboardFinancialData() {
  this.http.getApi('/Salary/ResidentsInspect').subscribe({
    next: (res: any) => {
      this.transactions = res;
      console.log(this.transactions);

      this.applyFilters(); // <--- 重點！抓到資料後立刻去計算顯示內容
    }
  });
}

// --- 3. 核心過濾邏輯 ---

// --- 4. 修改分頁更新邏輯 ---
updateDisplayData() {
  const start = (this.p - 1) * this.itemsPerPage;
  // 注意：這裡要切片的是過濾後的 filteredTransactions
  this.displayTransactions = this.filteredTransactions.slice(start, start + this.itemsPerPage);
}

// 重設
resetFilters() {

  this.searchTerm = '';
  this.month='';
  this.fetchDashboardFinancialData()

}

// 修正 Getter (總頁數要改看過濾後的筆數)
get totalPages(): number {
  return Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
}

get pageNumbers(): number[] {
  return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}
}
