import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { OrderService } from '@shared';
import { CartStore } from '@shared';
import { OrderRequest } from '@shared';

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
      sendOrder(checkoutData: { paymentMethod: string; customerComment: string }) {
        const currentTableId = cartStore.tableId();
        const currentCart = cartStore.cart();

        if (currentCart.length === 0) {
          alert('⚠️ La cistella està buida!');
          return;
        }

        patchState(store, { isLoading: true });

        const orderRequest: OrderRequest = {
          orderType: currentTableId ? 'DINE_IN' : 'TAKEAWAY',
          paymentMethod: checkoutData.paymentMethod,
          customerComment: checkoutData.customerComment || '',
          items: currentCart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            notes: item.notes || '',
          })),
        };

        if (currentTableId) {
          orderRequest.tableId = currentTableId;
        }

        orderService.createOrder(orderRequest).subscribe({
          next: (response) => {
            console.log('✅ Order created in Back:', response);
            patchState(store, { isLoading: false });
            cartStore.clearCart();

            router.navigate(['/order-status', response.id]);
          },
          error: (err) => {
            console.error('❌ Error enviando la comanda:', err);
            alert("Ha fallat l'enviament de la comanda. Revisa la consola o avisa a un cambrer.");
            patchState(store, { isLoading: false });
          },
        });
      },
    }),
  ),
);
