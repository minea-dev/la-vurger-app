import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartStore } from '../store/cart.store';

export const checkoutGuard: CanActivateFn = () => {
  const cartStore = inject(CartStore);
  const router = inject(Router);

  if (cartStore.cartItemsCount() > 0) {
    return true;
  }

  return router.parseUrl('/menu');
};
