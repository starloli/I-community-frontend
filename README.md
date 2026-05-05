# 📋 I-COMMUNITY 智能社區管理平台 - 功能大綱

## 一、系統架構概述
- **後端**：Spring Boot (Java) REST API
- **前端**：Angular 19 現代 Web 應用
- **技術棧**：Spring Data JPA、Angular Material、RxJS

---

## 二、核心功能模組

### 1️⃣ 身份認證與授權系統
**服務層**：`AuthService`
- 🔐 **登入/登出**
  - 用戶登入驗證
  - 令牌生成與管理
  
- 🔑 **密碼管理**
  - 忘記密碼功能
  - 密碼重設功能
  - 使用 Email 重設令牌
  
- ✉️ **郵件驗證**
  - 生成電郵驗證碼
  - 驗證郵件碼
  
- 👥 **角色權限控制**
  - **4 個用戶角色**：`SUPER_ADMIN` (超級管理員)、`ADMIN` (管理員)、`RESIDENT` (住戶)
  - 路由守衛：`adminGuard`、`authGuard`

---

### 2️⃣ 用戶管理系統
**服務層**：`UserService`、`ModifyResidentService`
- 👤 **用戶檔案管理**
  - 查詢用戶資訊
  - 修改用戶檔案
  
- 👨‍💼 **住戶管理**（管理員）
  - 修改住戶資料（管理員操作）
  - 超級管理員修改住戶資料（含稽核追蹤）
  
- 👤 **自助服務**
  - 住戶修改自身資料
  - 管理員修改自身資料
  
- 📊 **用戶資料統計**

---

### 3️⃣ 訪客管理系統
**服務層**：`VisitorService`
**實體**：`Visitor`
- 📋 **訪客登記**
  - 住戶新增訪客信息
  - 保全管理訪客記錄
  
- 🔄 **訪客狀態管理**
  - 狀態：`INSIDE` (在內) / `LEFT` (已離開)
  - 更新訪客狀態
  
- 🔍 **訪客查詢**
  - 按住戶查詢訪客
  - 按建築物地址查詢住戶資料
  - 所有訪客列表
  
- ❌ **訪客刪除**

- 🎯 **訪客對話窗**（前端組件）

---

### 4️⃣ 帳單管理系統
**服務層**：`BillService`
**實體**：`Bill`
**枚舉**：
- 帳單類型：`WATER` (水費)、`ELECTRICITY` (電費)、`MANAGEMENT` (管理費)、`MAINTENANCE` (維修費)、`OTHER` (其他)
- 帳單狀態：`UNPAID` (待繳)、`PAID` (已繳)、`OVERDUE` (逾期)

- 📝 **帳單建立與查詢**
  - 為住戶生成帳單
  - 查詢帳單清單
  
- 💳 **帳單支付**
  - 線上支付整合（ECPay）
  - 支付表單生成
  - 支付回調處理
  - 支付方式記錄
  
- 📊 **帳單統計**
  - 按類型統計
  - 按狀態統計

---

### 5️⃣ 設施管理系統
**服務層**：`FacilityService`
**實體**：`Facility`

- 🏢 **設施資訊管理**
  - 建立設施（如社區活動中心、健身房等）
  - 修改設施資訊
  - 刪除設施
  - 查詢所有設施
  
- ⚙️ **設施屬性**
  - 名稱、描述、容納人數
  - 開放時間、關閉時間
  - 是否可預約、是否可用

---

### 6️⃣ 設施預約系統
**服務層**：`ReservationService`
**實體**：`Reservation`
**狀態**：`CONFIRMED` (已確認)、`CONFIRMING` (確認中)、`CANCELLED` (已取消)

- 📅 **預約管理**
  - 住戶預約設施
  - 日曆界面（使用 `angular-calendar`）
  - 查詢預約列表
  
- ✅ **預約確認**
  - 管理員審核預約
  - 自動確認機制
  
- ❌ **取消預約**
  - 住戶取消預約
  - 管理員取消預約
  
- 📧 **預約通知**
  - 預約成功郵件通知
  - 使用 `date-fns` 處理日期

---

### 7️⃣ 包裹管理系統
**服務層**：`PackageService`
**實體**：`Package`
**狀態**：`WAITING` (等待)、`PICKED_UP` (已領取)

- 📦 **包裹登記**
  - 物流查詢（含快遞公司、追蹤號）
  - 包裹到達日期
  
- 📍 **包裹位置管理**
  - 記錄單位號碼
  - 領取時間追蹤
  
- 🔔 **包裹通知**
  - 標記是否已通知住戶
  - 通知類型：`PACKAGE` (包裹通知)
  
- 👤 **搜尋與領取**
  - 按住戶名稱搜尋
  - 標記包裹為已領取

---

### 8️⃣ 維修請求系統
**服務層**：`RepairRequestService`
**實體**：`RepairRequest`
**狀態**：`PENDING` (待處理)、`IN_PROGRESS` (進行中)、`DONE` (完成)

- 🔧 **維修請求提交**
  - 住戶報修
  - 維修類別、地點、描述
  - 上傳圖片（`imageUrl`）
  
- 📝 **維修追蹤**
  - 查詢個人維修歷史
  - 狀態更新
  
- ✅ **維修完成**
  - 標記維修完成
  - 記錄完成日期
  - 指派維修人員
  
- 🗑️ **刪除維修記錄**

---

### 9️⃣ 公告系統
**服務層**：`AnnouncementService`
**實體**：`Announcement`

- 📢 **公告發佈**
  - 標題、內容、分類
  - 作者信息
  - 發佈時間、過期時間
  
- 📌 **公告置頂**
  - 置頂重要公告
  
- 🔔 **公告通知**
  - 通知類型：`ANNOUNCE` (公告)
  - 自動推送到住戶

---

### 🔟 通知系統
**服務層**：`NotificationService`
**實體**：`Notification`
**通知類型**：`BILL` (帳單)、`PACKAGE` (包裹)、`REPAIR` (維修)、`ANNOUNCE` (公告)

- 🔔 **通知管理**
  - 創建通知
  - 標記為已讀
  
- ⏰ **定時推送**
  - 定時任務配置
  - 動態排程更新
  
- 📧 **郵件通知**
  - 預約成功通知
  - 帳單提醒
  - 其他系統事件通知

---

### 1️⃣1️⃣ 統計與儀表板
**服務層**：`StatisticsController`

- 📊 **管理員儀表板**
  - 社區關鍵指標
  - 數據統計與分析
  
- 👥 **住戶儀表板**
  - 個人帳單概覽
  - 待處理事項

---

### 1️⃣2️⃣ 郵件服務系統
**服務層**：`EmailService`

- ✉️ **郵件功能**
  - 發送簡單郵件
  - 發送密碼重設郵件
  - HTML 格式支持

---

## 三、前端頁面結構

### 🔐 公開頁面
- 登入頁面 (`LoginComponent`)
- 忘記密碼 (`ForgetPasswordComponent`)
- 重設密碼 (`ResetPasswordComponent`)
- 訪客對話窗 (`VisitorDialogComponent`)

### 🛡️ 管理員模塊 (`/admin` - 需 `adminGuard`)

| 功能 | 頁面 | 路由 |
|------|------|------|
| 用戶資訊 | `UserInfoComponent` | `/admin/userInfo` |
| 儀表板 | `DashboardComponent` | `/admin/dashboard` |
| 訪客管理 | `VisitorComponent` | `/admin/visitor` |
| 公告管理 | `AnnouncementComponent` | `/admin/announcement` |
| 帳單管理 | `BillComponent` | `/admin/bill` |
| 設施管理 | `FacilityComponent` | `/admin/facility` |
| 包裹管理 | `PackageComponent` | `/admin/package` |
| 維修管理 | `RepairComponent` | `/admin/repair` |
| 修改住戶 | `ModifyResidentComponent` | `/admin/ModifyResident` |

### 👥 住戶模塊 (`/resident` - 需 `authGuard`)

| 功能 | 頁面 | 路由 |
|------|------|------|
| 用戶資訊 | `UserInfoComponent` | `/resident/userInfo` |
| 儀表板 | `ResidentDashboardComponent` | `/resident/dashboard` |
| 公告 | `ResidentAnnouncementComponent` | `/resident/announcement` |
| 帳單 | `ResidentBillComponent` | `/resident/bill` |
| 設施預約 | `ResidentFacilityComponent` | `/resident/facility` |
| 包裹 | `ResidentPackageComponent` | `/resident/package` |
| 維修請求 | `ResidentRepairComponent` | `/resident/repair` |
| 訪客管理 | `ResidentVisitorComponent` | `/resident/visitor` |

### 📱 對話框組件
- 帳單對話框 (`billsdialog`)
- 編輯住戶 (`edit-resident`)
- 編輯用戶 (`edit-user`)
- 設施配置 (`facility-config`)
- 設施登記 (`regist-facility`)
- 預約日曆 (`reservation-calendar`)
- 預約設施 (`reserve-facility`)
- 發送帳單 (`send-bill`)
- 更新設施 (`update-facility`)
- 訪客對話 (`visitor-dialog`)

---

## 四、核心服務與攔截器

### 服務層 (@service)

| 服務 | 職責 |
|------|------|
| `AuthService` | 身份驗證、密碼重設、郵件驗證 |
| `UserService` | 用戶檔案管理 |
| `BillService` | 帳單管理與統計 |
| `FacilityService` | 設施管理 |
| `ReservationService` | 設施預約 |
| `PackageService` | 包裹管理 |
| `RepairRequestService` | 維修請求 |
| `AnnouncementService` | 公告管理 |
| `VisitorService` | 訪客管理 |
| `NotificationService` | 通知與定時任務 |
| `EmailService` | 郵件發送 |
| `EcpayService` | 線上支付整合 |
| `ModifyResidentService` | 住戶資料修改（含角色授權） |

### 攔截器 (@interceptors)
- `AuthInterceptor` - 請求頭加入認證令牌
- `ErrorInterceptor` - 統一錯誤處理

### 路由守衛 (@guards)
- `AdminGuard` - 管理員頁面保護
- `AuthGuard` - 住戶頁面保護

---

## 五、資料實體關係

```
User (用戶) ─────┬─→ Bill (帳單)
                 ├─→ Announcement (公告)
                 ├─→ Package (包裹)
                 ├─→ RepairRequest (維修)
                 ├─→ Reservation (預約)
                 ├─→ Visitor (訪客)
                 ├─→ Notification (通知)
                 └─→ EmailVerifyCode (郵件驗證碼)

Facility (設施) ─→ Reservation (預約)
PasswordResetToken (密碼重設令牌)
```

---

## 六、關鍵技術特性

✅ **前端技術**
- Angular 19 響應式框架
- Angular Material UI 組件庫
- Angular CDK 動畫與拖曳
- RxJS 非同步流管理
- Angular Calendar 日曆插件
- date-fns 日期處理

✅ **後端技術**
- Spring Boot REST API
- Spring Data JPA 資料持久化
- Spring Security 身份認證
- Email 服務整合
- ECPay 線上支付

✅ **系統特性**
- 多角色權限控制
- 郵件通知機制
- 定時任務調度
- 線上支付處理
- 異常統一處理

---

## 七、快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm start
```

### 構建生產版本
```bash
npm run build
```

### 運行測試
```bash
npm test
```

---

此專案為一個完整的智能社區管理平台，提供社區居民、管理員及保安人員各項所需的功能。
