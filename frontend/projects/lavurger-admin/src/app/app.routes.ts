import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { MenuManagerComponent } from './features/menu-manager/menu-manager.component';
import { KitchenDashboardComponent } from './features/kitchen-dashboard/kitchen-dashboard.component';
import { MonitorComponent } from './features/monitor/monitor.component';
import { UsersComponent } from './features/users/users.component';

import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/login/login.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'kitchen', component: KitchenDashboardComponent },
      { path: 'menu', component: MenuManagerComponent },
      { path: 'monitor', component: MonitorComponent },
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'kitchen', pathMatch: 'full' },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
