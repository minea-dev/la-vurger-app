import { isPlatformBrowser } from '@angular/common';
import { computed, inject, effect, PLATFORM_ID } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
  withHooks,
} from '@ngrx/signals';
import { ProductDTO } from '../../shared/models/dtos/product.dto';
import { ApiService } from '../../core/services/api.service';
import { OrderRequest } from '../../shared/models/dtos/order.dto';

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}

type MenuState = {
  products: ProductDTO[];
  categories: string[];
  selectedCategory: string;
  cart: CartItem[];
  isLoading: boolean;
  tableId: number | null;
  searchQuery: string;
};

const initialState: MenuState = {
  products: [],
  categories: ['burgers', 'burritos', 'sides', 'drinks'],
  selectedCategory: 'burgers',
  cart: [],
  isLoading: false,
  tableId: null,
  searchQuery: '',
};

export const MenuStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ products, selectedCategory, cart, searchQuery }) => ({
    filteredProducts: computed(() => {
      const category = selectedCategory();
      const query = searchQuery().toLowerCase().trim();

      return products().filter((p) => {
        const matchesCategory = p.category === category;

        const matchesQuery =
          query === ''
            ? true
            : p.name.toLowerCase().includes(query) ||
              (p.description?.toLowerCase().includes(query) ?? false);

        return matchesCategory && matchesQuery;
      });
    }),

    cartTotal: computed(() =>
      cart().reduce((total, item) => total + item.product.price * item.quantity, 0),
    ),

    cartItemsCount: computed(() => cart().reduce((count, item) => count + item.quantity, 0)),
  })),

  withMethods((store, apiService = inject(ApiService)) => ({
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query });
    },

    setTableId(id: number) {
      patchState(store, { tableId: id });
    },

    setCategory(category: string) {
      patchState(store, { selectedCategory: category });
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
        const updatedCart = currentCart.map((item) => {
          return item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item;
        });
        patchState(store, { cart: updatedCart });
      } else {
        const updatedCart = currentCart.filter((item) => item.product.id !== productId);
        patchState(store, { cart: updatedCart });
      }
    },

    clearCart() {
      patchState(store, { cart: [] });
    },

    loadProducts() {
      patchState(store, { isLoading: true });

      apiService.getProducts().subscribe({
        next: (productsFromDB) => {
          patchState(store, { products: productsFromDB, isLoading: false });
        },
        error: (err) => {
          console.error('❌ Error loading products from Back:', err);
          patchState(store, { isLoading: false });
        },
      });
    },

    sendOrder(checkoutData: { paymentMethod: string; customerComment: string }) {
      const currentTableId = store.tableId();
      const currentCart = store.cart();

      if (currentCart.length === 0) {
        alert('⚠️ La cistella està buida!');
        return;
      }

      patchState(store, { isLoading: true });

      const orderRequest: OrderRequest = {
        tableId: currentTableId,
        orderType: currentTableId ? 'DINE_IN' : 'TAKE_AWAY',
        paymentMethod: checkoutData.paymentMethod,
        customerComment: checkoutData.customerComment,
        items: currentCart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      apiService.createOrder(orderRequest).subscribe({
        next: (response) => {
          console.log('✅ Order created in Back:', response);
          alert(`🎉 Comanda enviada a cuina!`);
          patchState(store, { cart: [], isLoading: false });
          // Opcional: Aquí podrías inyectar el Router y navegar a una página de éxito
        },
        error: (err) => {
          console.error('❌ Error sending order:', err);
          alert("Ha fallat l'enviament de la comanda. Avisa a un cambrer.");
          patchState(store, { isLoading: false });
        },
      });
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
              const parsedCart = JSON.parse(savedCart);
              patchState(store, { cart: parsedCart });
            } catch (e) {
              console.error('⚠️ Error llegint la cistella del LocalStorage', e);
            }
          }
          let isFirstRun = true;

          effect(() => {
            const currentCart = store.cart();
            if (isFirstRun) {
              isFirstRun = false;
              return;
            }

            if (currentCart.length === 0) {
              localStorage.removeItem('vurger_cart');
            } else {
              localStorage.setItem('vurger_cart', JSON.stringify(currentCart));
            }
          });
        }
      },
    };
  }),
);
