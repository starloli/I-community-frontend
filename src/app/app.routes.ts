import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { ResidentLayoutComponent } from './shared/resident-layout/resident-layout.component';

// ── 管理員頁面 ────────────────────────────────────────
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VisitorComponent } from './pages/visitor/visitor.component';
import { AnnouncementComponent } from './pages/announcement/announcement.component';
import { BillComponent } from './pages/bill/bill.component';
import { FacilityComponent } from './pages/facility/facility.component';
import { PackageComponent } from './pages/package/package.component';
import { RepairComponent } from './pages/repair/repair.component';

// ── 住戶頁面（之後陸續新增）──────────────────────────
import { ResidentDashboardComponent } from './pages/resident/dashboard/dashboard.component';
import { ResidentAnnouncementComponent } from './pages/resident/announcement/announcement.component';
import { BillComponent as ResidentBillComponent } from './pages/resident/bill/bill.component';
import { ResidentFacilityComponent } from './pages/resident/facility/facility.component';
import { PackageComponent as ResidentPackageComponent } from './pages/resident/package/package.component';
// import { ResidentRepairComponent } from './pages/resident/repair/resident-repair.component';

export const routes: Routes = [
  // ── 登入頁 ──────────────────────────────────────────
  { path: 'login', component: LoginComponent },

  // ── 管理員路由 ───────────────────────────────────────
  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'visitor', component: VisitorComponent },
      { path: 'announcement', component: AnnouncementComponent },
      { path: 'bill', component: BillComponent },
      { path: 'facility', component: FacilityComponent },
      { path: 'package', component: PackageComponent },
      { path: 'repair', component: RepairComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  // ── 住戶路由 ─────────────────────────────────────────
  {
    path: 'resident',
    component: ResidentLayoutComponent,
    children: [
      // 頁面做好後逐一取消註解
      { path: 'dashboard', component: ResidentDashboardComponent },
      { path: 'announcement', component: ResidentAnnouncementComponent },
      { path: 'bill',         component: ResidentBillComponent },
      { path: 'facility',     component: ResidentFacilityComponent },
      { path: 'package',      component: ResidentPackageComponent },
      // { path: 'repair',       component: ResidentRepairComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
