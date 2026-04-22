import { computed, inject, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { ProductDTO } from '../../models/dtos/product.dto';

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}

type CartState = {
  cart: CartItem[];
  tableId: number | null;
};

const initialState: CartState = {
  cart: [],
  tableId: null,
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ cart }) => ({
    cartTotal: computed(() =>
      cart().reduce((total, item) => total + item.product.price * item.quantity, 0),
    ),
    cartItemsCount: computed(() => cart().reduce((count, item) => count + item.quantity, 0)),
  })),

  withMethods((store) => ({
    setTableId(id: number) {
      patchState(store, { tableId: id });
    },

    addToCart(product: ProductDTO) {
      const currentCart = store.cart();
      const existingItem = currentCart.find((item) => item.product.id === product.id);

      if (existingItem) {
        const updatedCart = currentCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
        patchState(store, { cart: updatedCart });
      } else {
        patchState(store, { cart: [...currentCart, { product, quantity: 1 }] });
      }
    },

    decreaseQuantity(productId: number) {
      const currentCart = store.cart();
      const existingItem = currentCart.find((item) => item.product.id === productId);

      if (!existingItem) return;

      if (existingItem.quantity > 1) {
        const updatedCart = currentCart.map((item) =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
        );
        patchState(store, { cart: updatedCart });
      } else {
        const updatedCart = currentCart.filter((item) => item.product.id !== productId);
        patchState(store, { cart: updatedCart });
      }
    },

    clearCart() {
      patchState(store, { cart: [] });
    },
  })),

  withHooks((store) => {
    const platformId = inject(PLATFORM_ID);
    return {
      onInit() {
        if (isPlatformBrowser(platformId)) {
          const savedCart = localStorage.getItem('vurger_cart');
          if (savedCart) {
            try {
              patchState(store, { cart: JSON.parse(savedCart) });
            } catch (e) {
              console.error('⚠️ Error llegint cistella', e);
            }
          }

          let isFirstRun = true;
          effect(() => {
            const currentCart = store.cart();
            if (isFirstRun) {
              isFirstRun = false;
              return;
            }
            if (currentCart.length === 0) localStorage.removeItem('vurger_cart');
            else localStorage.setItem('vurger_cart', JSON.stringify(currentCart));
          });
        }
      },
    };
  }),
);
