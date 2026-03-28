import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { ProductDTO } from '../../shared/models/dtos/product.dto';
import { ProductService } from './services/product.service';

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}

type CheckoutState = {
  products: ProductDTO[];
  cart: CartItem[];
  selectedCategory: string;
  isLoading: boolean;
};

const initialState: CheckoutState = {
  products: [],
  cart: [],
  selectedCategory: '',
  isLoading: false,
};

export const CheckoutStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ products, cart, selectedCategory }) => ({
    categories: computed(() => {
      const cats = products().map(p => p.category);
      return [...new Set(cats)];
    }),
    filteredProducts: computed(() => {
      return products().filter(p => p.category === selectedCategory());
    }),
    cartTotal: computed(() => {
      return cart().reduce((total, item) => total + (item.product.price * item.quantity), 0);
    })
  })),
  withMethods((store, productService = inject(ProductService)) => ({

    setCategory(category: string) {
      patchState(store, { selectedCategory: category });
    },

    addToCart(product: ProductDTO) {
      const currentCart = store.cart();
      const existingItem = currentCart.find(item => item.product.id === product.id);

      if (existingItem) {
        const updatedCart = currentCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        patchState(store, { cart: updatedCart });
      } else {
        patchState(store, { cart: [...currentCart, { product, quantity: 1 }] });
      }
    },

    loadProducts() {
      patchState(store, { isLoading: true });
      productService.getAllProducts().subscribe({
        next: (products) => {
          const defaultCategory = products.length > 0 ? products[0].category : '';
          patchState(store, { products, isLoading: false, selectedCategory: defaultCategory });
        },
        error: (err) => {
          console.error('Error fetching products from API:', err);
          patchState(store, { isLoading: false });
        }
      });
    }

  }))
);
