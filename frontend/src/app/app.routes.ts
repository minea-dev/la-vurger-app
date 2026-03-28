import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'checkout',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'kitchen',
    loadComponent: () => import('./features/kitchen/kitchen.component').then(m => m.KitchenComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: '**',
    redirectTo: 'checkout'
  }
];
