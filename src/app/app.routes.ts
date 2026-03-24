import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';

// ── 管理員頁面 ────────────────────────────────────────
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VisitorComponent } from './pages/visitor/visitor.component';
import { AnnouncementComponent } from './pages/announcement/announcement.component';
import { BillComponent } from './pages/bill/bill.component';
import { FacilityComponent } from './pages/facility/facility.component';
import { PackageComponent } from './pages/package/package.component';
import { RepairComponent } from './pages/repair/repair.component';

// ── 住戶頁面（之後新增時再 import）────────────────────
// import { ResidentLayoutComponent } from './shared/resident-layout/resident-layout.component';
// import { ResidentDashboardComponent } from './pages/resident/dashboard/dashboard.component';
// import { ResidentAnnouncementComponent } from './pages/resident/announcement/announcement.component';
// import { ResidentBillComponent } from './pages/resident/bill/bill.component';
// import { ResidentFacilityComponent } from './pages/resident/facility/facility.component';
// import { ResidentPackageComponent } from './pages/resident/package/package.component';
// import { ResidentRepairComponent } from './pages/resident/repair/repair.component';

export const routes: Routes = [
  // ── 登入頁 ──────────────────────────────────────────
  { path: 'login', component: LoginComponent },

  // ── 管理員路由 ───────────────────────────────────────
  {
    path: 'admin',
    component: LayoutComponent,
    // TODO: 加上 AdminGuard 防止住戶直接進入
    // canActivate: [AdminGuard],
    children: [
      { path: 'dashboard',    component: DashboardComponent },
      { path: 'visitor',      component: VisitorComponent },
      { path: 'announcement', component: AnnouncementComponent },
      { path: 'bill',         component: BillComponent },
      { path: 'facility',     component: FacilityComponent },
      { path: 'package',      component: PackageComponent },
      { path: 'repair',       component: RepairComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  // ── 住戶路由（之後新增頁面時再開啟）─────────────────
  // {
  //   path: 'resident',
  //   component: ResidentLayoutComponent,
  //   // canActivate: [ResidentGuard],
  //   children: [
  //     { path: 'dashboard',    component: ResidentDashboardComponent },
  //     { path: 'announcement', component: ResidentAnnouncementComponent },
  //     { path: 'bill',         component: ResidentBillComponent },
  //     { path: 'facility',     component: ResidentFacilityComponent },
  //     { path: 'package',      component: ResidentPackageComponent },
  //     { path: 'repair',       component: ResidentRepairComponent },
  //     { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  //   ]
  // },

  // ── 預設導向 ─────────────────────────────────────────
  // TODO: 登入後根據角色導向，改成由 login component 處理
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
