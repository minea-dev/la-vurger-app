import { Routes } from '@angular/router';
import { checkoutGuard } from '@shared/core/guards/checkout.guard';
import { orderStatusGuard } from '@shared/core/guards/order-status.guard';
import { authGuard } from '@shared/core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'menu',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
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
    path: 'orders',
    loadComponent: () =>
      import('./features/orders/orders.component').then((m) => m.OrdersComponent),
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: 'menu',
  },
];
