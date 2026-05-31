import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { OrderService } from '@shared';
import { CartStore } from '@shared';
import { OrderRequest } from '@shared';
import { firstValueFrom } from 'rxjs';

type CheckoutState = {
  isLoading: boolean;
};

export const CheckoutStore = signalStore(
  { providedIn: 'root' },
  withState({ isLoading: false }),

  withMethods(
    (
      store,
      orderService = inject(OrderService),
      cartStore = inject(CartStore),
      router = inject(Router),
    ) => ({
      async sendOrder(checkoutData: {
        paymentMethod: string;
        customerComment: string;
        guestName?: string;
        guestEmail?: string;
        guestPhone?: string;
      }) {
        const currentTableId = cartStore.tableId();
        const currentCart = cartStore.cart();

        if (currentCart.length === 0) {
          throw new Error('La cistella està buida');
        }

        patchState(store, { isLoading: true });

        const orderRequest: OrderRequest = {
          orderType: currentTableId ? 'DINE_IN' : 'TAKEAWAY',
          paymentMethod: checkoutData.paymentMethod,
          customerComment: checkoutData.customerComment || '',
          guestName: checkoutData.guestName,
          guestEmail: checkoutData.guestEmail,
          guestPhone: checkoutData.guestPhone,
          items: currentCart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            notes: item.notes || '',
          })),
        };

        if (currentTableId) {
          orderRequest.tableId = currentTableId;
        }

        try {
          const response = await firstValueFrom(orderService.createOrder(orderRequest));

          patchState(store, { isLoading: false });
          cartStore.clearCart();

          router.navigate(['/order-status', response.id], {
            queryParamsHandling: 'preserve',
            replaceUrl: true,
          });
        } catch (error) {
          patchState(store, { isLoading: false });
          throw error;
        }
      },
    }),
  ),
);
