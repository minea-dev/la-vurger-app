import { Routes } from '@angular/router';
import { checkoutGuard } from '@shared/core/guards/checkout.guard';
import { orderStatusGuard } from '@shared/core/guards/order-status.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'menu',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/menu.component').then((m) => m.MenuComponent),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
    canActivate: [checkoutGuard],
  },
  {
    path: 'order-status/:id',
    loadComponent: () =>
      import('./features/order-status/order-status.component').then((m) => m.OrderStatusComponent),
    canActivate: [orderStatusGuard],
  },
  {
    path: '**',
    redirectTo: 'menu',
  },
];
