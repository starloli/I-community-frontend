import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { ResidentLayoutComponent } from './shared/resident-layout/resident-layout.component';

// ── 管理員頁面 ────────────────────────────────────────
import { DashboardComponent } from './pages/@admin/dashboard/dashboard.component';
import { AnnouncementComponent } from './pages/@admin/announcement/announcement.component';
import { BillComponent } from './pages/@admin/bill/bill.component';
import { FacilityComponent } from './pages/@admin/facility/facility.component';
import { PackageComponent } from './pages/@admin/package/package.component';
import { RepairComponent } from './pages/@admin/repair/repair.component';

// ── 住戶頁面（之後陸續新增）──────────────────────────
import { ResidentDashboardComponent } from './pages/@resident/dashboard/dashboard.component';
import { ResidentAnnouncementComponent } from './pages/@resident/announcement/announcement.component';
import { BillComponent as ResidentBillComponent } from './pages/@resident/bill/bill.component';
import { ResidentFacilityComponent } from './pages/@resident/facility/facility.component';
import { PackageComponent as ResidentPackageComponent } from './pages/@resident/package/package.component';
import { ResidentRepairComponent } from './pages/@resident/repair/repair.component';

import { VisitorDialogComponent } from './dialog/visitor-dialog/visitor-dialog.component';
import { ViewComponent } from './pages/@admin/announcement/view/view.component';
import { CreateComponent } from './pages/@admin/announcement/create/create.component';
import { VisitorComponent as AdminVisitorComponent } from './pages/@admin/visitor/admin-visitor.component';

export const routes: Routes = [
  // ── 登入頁 ──────────────────────────────────────────
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {path:'visitorDialog' ,component:VisitorDialogComponent},
  {
    path: 'admin',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'visitor', component: AdminVisitorComponent },
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
      { path: 'repair',       component: ResidentRepairComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
]
