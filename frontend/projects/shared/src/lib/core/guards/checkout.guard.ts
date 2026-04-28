import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartStore } from '../store/cart.store';

export const checkoutGuard: CanActivateFn = (route) => {
  const cartStore = inject(CartStore);
  const router = inject(Router);

  if (cartStore.cartItemsCount() > 0) {
    return true;
  }

  const tableId = route.queryParamMap.get('table') || sessionStorage.getItem('vurger_table');

  if (tableId) {
    return router.createUrlTree(['/menu'], {
      queryParams: { table: tableId },
    });
  }

  return router.createUrlTree(['/menu']);
};
