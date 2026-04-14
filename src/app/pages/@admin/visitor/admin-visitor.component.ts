import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';

import { VisitorServiceService } from '../../../@service/visitor-service.service';
import { VisitorDialogComponent } from '../../../dialog/visitor-dialog/visitor-dialog.component';
import { HttpService } from '../../../@service/http.service';

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatPaginatorModule
  ],
  templateUrl: './admin-visitor.component.html',
  styleUrl: './admin-visitor.component.scss'
})
export class VisitorComponent implements OnInit {
  // ── 注入服務 ──────────────────────────────────────────
  private http = inject(HttpService);
  private service = inject(VisitorServiceService);
  private dialog = inject(MatDialog);

  // ── 公開 Math 物件給模板使用 ───────────────────────────
  readonly Math = Math;

  // ── 分頁設定 ──────────────────────────────────────────
  currentPage = 1;
  pageSize = 10;

  // ── 訪客資料相關 ──────────────────────────────────────
  allVisitor: any[] = [];                    // 所有訪客列表
  addressList: string[] = [];                // 所有門牌地址列表
  currentResidents: any[] = [];              // 當前選中地址的住戶列表
  addressMap = new Map<string, any>();      // 地址與住戶的映射緩存

  // ── 表單控制 ──────────────────────────────────────────
  showForm = false;                          // 是否顯示新增訪客表單
  step = 1;                                  // 表單步驟（1：選擇住戶，2：輸入訪客資訊）
  searchKeyword = '';                        // 搜尋關鍵字
  isComposing = false;                       // 中文輸入法標誌（避免中文輸入時觸發過濾）

  // ── 新增訪客表單欄位 ──────────────────────────────────
  selectedAddress = '';                      // 選中的地址
  addressID: number | null = null;           // 選中住戶的 ID
  newVisitorName = '';                       // 訪客姓名
  newVisitorPhone = '';                      // 訪客電話
  newVisitorLicensePlate = '';               // 訪客車牌
  newVisitorPurpose = '';                    // 訪客來訪目的

  // ── 組件初始化 ────────────────────────────────────────
  ngOnInit(): void {
    this.getAllVisitors();
    this.getAllAddresses();
  }

  /**
   * 取得所有訪客資料
   * 從後端 API 獲取訪客列表，格式化時間後按倒序排列
   */
  getAllVisitors() {
    this.http.getApi('/visitor/getVisitor').subscribe({
      next: (res: any) => {
        const rawData = Array.isArray(res) ? res : (res?.data || []);
        const formattedData = rawData.map((visitor: any) => ({
          ...visitor,
          estimatedTime: visitor.estimatedTime ? visitor.estimatedTime.replace('T', ' ').slice(0, 16) : '-',
          checkInTime: visitor.checkInTime ? visitor.checkInTime.replace('T', ' ').slice(0, 16) : '-',
          checkOutTime: visitor.checkOutTime ? visitor.checkOutTime.replace('T', ' ').slice(0, 16) : '-',
        }));
        const statusPriority: { [key: string]: number } = {
        'NOTYET': 1, // 未到訪 (請確認後端對應的字串，可能是 PENDING 或其他)
        'INSIDE': 2,   // 在內
        'LEFT': 3,    // 已離開 (請確認後端對應的字串，可能是 COMPLETED)
      };this.allVisitor = formattedData.sort((a: any, b: any) => {
        const priorityA = statusPriority[a.status] || 99; // 找不到狀態就排最後
        const priorityB = statusPriority[b.status] || 99;

        if (priorityA !== priorityB) {
          return priorityA - priorityB; // 先按狀態權重排
        }

        // 如果狀態相同，按時間倒序排列 (新的在前)
        return new Date(b.estimatedTime).getTime() - new Date(a.estimatedTime).getTime();
      });

      }
    });

  }

  /**
   * 取得所有門牌地址
   * 用於搜尋住戶時的地址列表
   */
  getAllAddresses() {
    this.http.getApi('/visitor/allAddresses').subscribe((res: any) => {
      this.addressList = Array.isArray(res) ? res.sort() : [];
    });
  }

  /**
   * 打開新增訪客表單
   */
  openForm() {
    this.showForm = true;
  }

  /**
   * 關閉表單並重置狀態
   */
  closeForm() {
    this.showForm = false;
    this.step = 1;
    this.clearFormFields();
  }

  /**
   * 清空表單所有欄位
   */
  clearFormFields() {
    this.newVisitorName = '';
    this.newVisitorPhone = '';
    this.newVisitorLicensePlate = '';
    this.newVisitorPurpose = '';
    this.selectedAddress = '';
    this.addressID = null;
    this.currentResidents = [];
  }

  /**
   * 進到下一步（選擇住戶 → 輸入訪客資訊）
   */
  nextStep() {
    if (this.addressID) {
      this.step++;
    }
  }

  /**
   * 返回上一步
   */
  lastStep() {
    this.step--;
  }

  /**
   * 地址變更時，取得該地址的住戶列表
   * @param address - 選中的地址
   */
  onAddressChange(address: string) {
    this.currentResidents = [];

    if (!address) {
      return;
    }

    // 優先從緩存取得，避免重複查詢
    if (this.addressMap.has(address)) {
      this.currentResidents = this.addressMap.get(address);
      return;
    }

    // 向後端查詢該地址的住戶
    this.http.getApi(`/visitor/by-address?address=${encodeURIComponent(address)}`).subscribe((data: any) => {
      this.currentResidents = data;
      this.addressMap.set(address, data);
    });
  }

  /**
   * 確認登記訪客
   * 向後端發送新增訪客請求
   */
  confirmRegister() {
    if (!this.newVisitorName.trim()) {
      return;
    }

    // 取得當前時間（考慮時區差異）
    const now = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);

    const payload = {
      visitorName: this.newVisitorName,
      visitorPhone: this.newVisitorPhone,
      licensePlate: this.newVisitorLicensePlate,
      purpose: this.newVisitorPurpose,
      hostUserId: this.addressID,
      checkInTime: now,
      status: 'INSIDE'
    };

    this.http.postApi('/visitor/saveVisitor', payload).subscribe(() => {
      this.getAllVisitors();
      this.closeForm();
    });
  }

  /**
   * 記錄訪客離開
   * @param id - 訪客 ID
   */
  checkOut(id: number) {
    this.http.putApi(`/visitor/checkOut/${id}`).subscribe(() => this.getAllVisitors());
  }

  /**
   * 記錄訪客進入
   * @param id - 訪客 ID
   */
  enterInside(id: number) {
    this.http.putApi(`/visitor/inside/${id}`).subscribe(() => this.getAllVisitors());
  }

  /**
   * 打開訪客詳情對話框
   * @param visitor - 訪客資料
   */
  visitorMore(visitor: any) {
    this.service.visitorId = visitor;
    this.service.permissions = 'admin';

    const dialogRef = this.dialog.open(VisitorDialogComponent, {
      data: {
        visitor,
        permissions: 'admin'
      }
    });

    // 如果需要監聽對話框關閉事件
    dialogRef.afterClosed().subscribe(result => {
      // 處理關閉後的邏輯
    });
  }

  /**
   * 搜尋訪客（已淘汰，使用 filteredVisitorsRaw 取代）
   */
  get filteredVisitors() {
    const keyword = this.searchKeyword.toLowerCase().trim();

    if (!keyword) {
      return this.allVisitor;
    }

    return this.allVisitor.filter((visitor) =>
      visitor.visitorName?.toLowerCase().includes(keyword) ||
      visitor.visitorPhone?.includes(keyword) ||
      visitor.licensePlate?.toLowerCase().includes(keyword) ||
      visitor.residentialAddress?.toLowerCase().includes(keyword)
    );
  }

  /**
   * 中文輸入法：開始輸入時觸發
   * 設定標誌以避免觸發過濾邏輯
   */
  onCompositionStart() {
    this.isComposing = true;
  }

  /**
   * 中文輸入法：結束輸入時觸發
   * 此時才執行過濾邏輯
   */
  onCompositionEnd(event: any) {
    this.isComposing = false;
    this.filterInput(event);
  }

  /**
   * 過濾訪客姓名輸入
   * 只允許英文字母和中文字符，過濾其他特殊字符
   * @param event - 輸入事件
   */
  filterInput(event: any) {
    if (this.isComposing) {
      return;
    }

    const regex = /[^a-zA-Z\u4e00-\u9fa5]/g;
    this.newVisitorName = event.target.value.replace(regex, '');
  }

  /**
   * 計算總頁數陣列
   * @returns 頁碼陣列 [1, 2, 3, ...]
   */
  get totalPagesArray(): number[] {
    const total = Math.ceil(this.filteredVisitorsRaw.length / this.pageSize);
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  /**
   * 搜尋並篩選訪客列表
   * 支援按姓名、電話、車牌、地址搜尋
   * @returns 篩選後的訪客列表
   */
  get filteredVisitorsRaw(): any[] {
    const keyword = this.searchKeyword.toLowerCase().trim();

    if (!keyword) {
      return this.allVisitor;
    }

    return this.allVisitor.filter((visitor) =>
      visitor.visitorName?.toLowerCase().includes(keyword) ||
      visitor.visitorPhone?.includes(keyword) ||
      visitor.licensePlate?.toLowerCase().includes(keyword) ||
      visitor.residentialAddress?.toLowerCase().includes(keyword)
    );
  }

  /**
   * 取得當前頁面的訪客列表
   * @returns 分頁後的訪客列表
   */
  get pagedVisitors(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredVisitorsRaw.slice(startIndex, startIndex + this.pageSize);
  }

  /**
   * 跳轉到指定頁碼
   * @param page - 頁碼
   */
  goToPage(page: number) {
    if (page < 1 || page > this.totalPagesArray.length) {
      return;
    }

    this.currentPage = page;
  }

  /**
   * 搜尋關鍵字變更時重置頁碼
   * 確保搜尋結果從第一頁開始顯示
   */
  onSearchChange() {
    this.currentPage = 1;
  }
}
