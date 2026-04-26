import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { MenuManagerComponent } from './features/menu-manager/menu-manager.component';
import { KitchenDashboardComponent } from './features/kitchen-dashboard/kitchen-dashboard.component';
import { MonitorComponent } from './features/monitor/monitor.component';
import { HistoryComponent } from './features/history/history.component';
import { UsersComponent } from './features/users/users.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/login/login.component';

import { Role } from '@shared';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'kitchen',
        component: KitchenDashboardComponent,
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.MANAGER, Role.KITCHEN] },
      },
      {
        path: 'monitor',
        component: MonitorComponent,
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.MANAGER, Role.CASHIER] },
      },
      {
        path: 'history',
        component: HistoryComponent,
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.MANAGER, Role.CASHIER] },
      },
      {
        path: 'menu',
        component: MenuManagerComponent,
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN, Role.MANAGER] },
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [roleGuard],
        data: { roles: [Role.ADMIN] },
      },
      { path: '', redirectTo: 'kitchen', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
