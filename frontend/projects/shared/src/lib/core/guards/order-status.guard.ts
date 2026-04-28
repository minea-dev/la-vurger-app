import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { OrderService, OrderStatus } from '@shared';

export const orderStatusGuard: CanActivateFn = (route) => {
  const orderService = inject(OrderService);
  const router = inject(Router);
  const orderId = route.paramMap.get('id');

  if (!orderId) {
    return router.createUrlTree(['/menu']);
  }

  return orderService.getOrderById(Number(orderId)).pipe(
    map((order) => {
      if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
        const savedTable = sessionStorage.getItem('vurger_table');

        return router.createUrlTree(['/menu'], {
          queryParams: savedTable ? { table: savedTable } : {},
          queryParamsHandling: 'merge',
        });
      }

      return true;
    }),
    catchError(() => {
      return of(router.createUrlTree(['/menu']));
    }),
  );
};
