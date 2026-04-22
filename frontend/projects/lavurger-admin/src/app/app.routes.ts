import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { MenuManagerComponent } from './features/menu-manager/menu-manager.component';
import { KitchenDashboardComponent } from './features/kitchen-dashboard/kitchen-dashboard.component';
import { MonitorComponent } from './features/monitor/monitor.component';
import { UsersComponent } from './features/users/users.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'kitchen', component: KitchenDashboardComponent },
      { path: 'menu', component: MenuManagerComponent },
      { path: 'monitor', component: MonitorComponent },
      { path: 'users', component: UsersComponent },
      { path: '', redirectTo: 'kitchen', pathMatch: 'full' }
    ]
  }
];
