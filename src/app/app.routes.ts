import { Res } from './interface/interface';
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { ResidentLayoutComponent } from './shared/resident-layout/resident-layout.component';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';

// ── 管理員頁面 ────────────────────────────────────────
import { DashboardComponent } from './pages/@admin/dashboard/dashboard.component';
import { BillComponent } from './pages/@admin/bill/bill.component';
import { AnnouncementComponent } from './pages/@admin/announcement/announcement.component';
import { FacilityComponent } from './pages/@admin/facility/facility.component';
import { PackageComponent } from './pages/@admin/package/package.component';
import { RepairComponent } from './pages/@admin/repair/repair.component';

// ── 住戶頁面（之後陸續新增）──────────────────────────
import { UserInfo as ResidentUserInfo } from './pages/@resident/user-info/user-info.component';
import { ResidentDashboardComponent } from './pages/@resident/dashboard/dashboard.component';
import { ResidentAnnouncementComponent } from './pages/@resident/announcement/announcement.component';
import { BillComponent as ResidentBillComponent } from './pages/@resident/bill/bill.component';
import { ResidentFacilityComponent } from './pages/@resident/facility/facility.component';
import { PackageComponent as ResidentPackageComponent } from './pages/@resident/package/package.component';
import { ResidentRepairComponent } from './pages/@resident/repair/repair.component';
import { VisitorComponent as ResidentVisitorComponent } from './pages/@resident/visitor/visitor.component';

import { VisitorDialogComponent } from './dialog/visitor-dialog/visitor-dialog.component';
import { ResetPassword } from './pages/reset-password/reset-password';
import { ForgetPassword } from './pages/forget-password/forget-password';
import { ModifyResidentComponent } from './pages/@admin/modify-resident/modify-resident.component';
import { UserInfo } from './pages/@admin/user-info/user-info';
import { VisitorComponent } from './pages/@admin/visitor/admin-visitor.component';

export const routes: Routes = [
  // ── 登入頁 ──────────────────────────────────────────
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'visitorDialog', component: VisitorDialogComponent },
  { path: 'reset-password', component: ResetPassword },
  { path: 'forget-password', component: ForgetPassword },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [adminGuard],
    canActivateChild: [adminGuard],
    children: [
      { path: 'userInfo', component: UserInfo },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'visitor', component: VisitorComponent },
      { path: 'announcement', component: AnnouncementComponent },
      { path: 'bill', component: BillComponent },
      { path: 'facility', component: FacilityComponent },
      { path: 'package', component: PackageComponent },
      { path: 'repair', component: RepairComponent },
      { path: 'ModifyResident', component: ModifyResidentComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  // ── 住戶路由 ─────────────────────────────────────────
  {
    path: 'resident',
    component: ResidentLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: 'userInfo', component: ResidentUserInfo },
      { path: 'dashboard', component: ResidentDashboardComponent },
      { path: 'announcement', component: ResidentAnnouncementComponent },
      { path: 'bill', component: ResidentBillComponent },
      { path: 'facility', component: ResidentFacilityComponent },
      { path: 'package', component: ResidentPackageComponent },
      { path: 'repair', component: ResidentRepairComponent },
      { path: 'visitor', component: ResidentVisitorComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
]
