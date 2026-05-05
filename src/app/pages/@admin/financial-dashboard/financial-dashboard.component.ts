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
import { ImageComponent } from '../../../dialog/image/image.component';
import { VisitorServiceService } from '../../../@service/visitor-service.service';
@Component({
  selector: 'app-financial-dashboard',
  imports: [MatIconModule, CommonModule, MatDialogModule, CommonModule, FormsModule, MatPaginatorModule, MatButtonModule,FormsModule],
  templateUrl: './financial-dashboard.component.html',
  styleUrl: './financial-dashboard.component.scss',
})
export class FinancialDashboardComponent {
  readonly dialog = inject(MatDialog);
  constructor(private http:HttpService,private service:VisitorServiceService){}

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
role!:string;


readonly SERVER_URL = 'http://localhost:8083';

  ngOnInit() {
    this.fetchFinancialData();
this.role=this.service.role;
    this.getMonth();

  }




  openDialog() {
    const ref = this.dialog.open(BookkeepingComponent, {
      width: '500px',
      disableClose: false // 點擊背景是否可以關閉
    });
    ref.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        console.log('收到刷新指令，重新獲取數據...');


 this.fetchFinancialData();

    this.getMonth();
      }
    });
  }

    openImage(imagePath: string) {
      this.service.image=imagePath;
    const ref = this.dialog.open(ImageComponent, {

      data:{imageUrl: this.SERVER_URL + imagePath},
      width: '500px',
      disableClose: false // 點擊背景是否可以關閉
    });

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


//找月份
serchMonth(val:string){

if (!val) return; // 如果清空了就不執行

  // 1. 處理格式轉換：將 "2026-04" 拆成 ["2026", "04"]
  const parts = val.split('-');
  const year = parts[0];
  const month = parseInt(parts[1]);

  this.http.getApi('/Salary/summary/'+year+'/'+month).subscribe({
    next: (res: any) => {
      // 更新你的表格與圖表數據
   this.totalBalance = res.balance;
      this.totalIncome = res.totalIncome;
      this.totalExpense = res.totalExpense;

      this.http.getApi('/Salary/summary/month/'+year+'/'+month).subscribe({
        next:(res:any)=>{
          console.log(res);
          this.transactions=res;
 this.applyFilters();
        }
      })


    },
    error: (err) => console.error('查詢失敗', err)
})
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
  this.http.getApi('/Salary/summary/now').subscribe({
    next: (res: any) => {
      console.log(res ,'看看有沒有圖片');

      this.transactions = res;
      this.applyFilters();
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
