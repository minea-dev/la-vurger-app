import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { OrderService } from '@shared';
import { OrderDTO } from '@shared';

type OrderStatusState = {
  order: OrderDTO | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: OrderStatusState = {
  order: null,
  isLoading: false,
  error: null,
};

export const OrderStatusStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, orderService = inject(OrderService)) => ({
    loadOrder(id: number) {
      patchState(store, { isLoading: true, error: null });

      orderService.getOrderById(id).subscribe({
        next: (order) => {
          patchState(store, { order, isLoading: false });
        },
        error: (err) => {
          console.error('❌ Error obtenint la comanda:', err);
          patchState(store, {
            error: "No s'ha pogut carregar la informació de la comanda.",
            isLoading: false,
          });
        },
      });
    },

    updateOrder(order: OrderDTO) {
      patchState(store, { order });
    },
  })),
);
