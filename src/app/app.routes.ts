import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VisitorComponent } from './pages/visitor/visitor.component';
import { AnnouncementComponent } from './pages/announcement/announcement.component';
import { BillComponent } from './pages/bill/bill.component';
import { FacilityComponent } from './pages/facility/facility.component';
import { PackageComponent } from './pages/package/package.component';
import { RepairComponent } from './pages/repair/repair.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { ViewComponent } from './pages/announcement/view/view.component';
import { CreateComponent } from './pages/announcement/create/create.component';
import { EditComponent } from './pages/announcement/edit/edit.component';

export const routes: Routes = [
{ path: '', redirectTo: 'login', pathMatch: 'full' },
{ path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'visitor', component: VisitorComponent },
      { path: 'announcement', component: AnnouncementComponent },
      { path: 'announcement/view/:id', component: ViewComponent },
      { path: 'announcement/create', component: CreateComponent },
      { path: 'announcement/edit/:id', component: CreateComponent },
      { path: 'bill', component: BillComponent },
      { path: 'facility', component: FacilityComponent },
      { path: 'package', component: PackageComponent },
      { path: 'repair', component: RepairComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },  { path: 'login', component: LoginComponent },
    ]
  },

];
