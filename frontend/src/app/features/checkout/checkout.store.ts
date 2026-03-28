import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { ProductDTO } from '../../shared/models/dtos/product.dto';

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}

type CheckoutState = {
  products: ProductDTO[];
  categories: string[];
  selectedCategory: string;
  cart: CartItem[];
  isLoading: boolean;
};

const initialState: CheckoutState = {
  products: [],
  categories: ['🍔 Vurguers', '🌯 Vurritos', '🍟 Acompanyaments', '🥤 Begudes'],
  selectedCategory: '🍔 Vurguers',
  cart: [],
  isLoading: false,
};

export const CheckoutStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ products, selectedCategory, cart }) => ({
    filteredProducts: computed(() =>
      products().filter(p => p.category === selectedCategory())
    ),

    cartTotal: computed(() =>
      cart().reduce((total, item) => total + (item.product.price * item.quantity), 0)
    ),

    cartItemsCount: computed(() =>
      cart().reduce((count, item) => count + item.quantity, 0)
    )
  })),

  withMethods((store) => ({

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

    decreaseQuantity(productId: number) {
      const currentCart = store.cart();
      const existingItem = currentCart.find(item => item.product.id === productId);

      if (!existingItem) return;

      if (existingItem.quantity > 1) {
        const updatedCart = currentCart.map(item => {
            return item.product.id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item;
          }
        );
        patchState(store, { cart: updatedCart });
      } else {
        const updatedCart = currentCart.filter(item => item.product.id !== productId);
        patchState(store, { cart: updatedCart });
      }
    },

    clearCart() {
      patchState(store, { cart: [] });
    },

    // Mock products
    loadProducts() {
      patchState(store, { isLoading: true });
      setTimeout(() => {
        patchState(store, {
          products: [
            // 🍔 VURGUERS (8)
            { id: 1, name: 'La Clàssica', description: 'Cigrons i blat de moro, tomàquet, enciam i salsa de la casa', price: 9.90, category: '🍔 Vurguers', imageUrl: '', isAvailable: true },
            { id: 2, name: 'La Doble Verda', description: 'Doble de llentilles i espinacs, cogombre encurtit i mostassa artesana', price: 12.50, category: '🍔 Vurguers', imageUrl: '', isAvailable: true },
            { id: 3, name: 'L’Albufera', description: 'Base d’arròs i fesols, ceba caramel·litzada i allioli de safrà', price: 11.50, category: '🍔 Vurguers', imageUrl: '', isAvailable: true },
            { id: 4, name: 'La Picantona', description: 'Proteïna de soja, jalapeños, formatge vegà fos i salsa brava', price: 10.90, category: '🍔 Vurguers', imageUrl: '', isAvailable: true },
            { id: 5, name: 'Muntanya i Creïlla', description: 'Bolets silvestres, trufa negra i parmentier de creïlla', price: 13.20, category: '🍔 Vurguers', imageUrl: '', isAvailable: true },
            { id: 6, name: 'La De l’Horta', description: 'Albergínia rostida, pimentó a la flama i ruca fresca', price: 10.50, category: '🍔 Vurguers', imageUrl: '', isAvailable: true },
            { id: 7, name: 'Cruixent de Quinoa', description: 'Quinoa i carabassa, kale cruixent i melmelada de tomàquet', price: 11.20, category: '🍔 Vurguers', imageUrl: '', isAvailable: true },
            { id: 8, name: 'La Barbacoa Vegana', description: 'Seitan fumat, anelles de ceba i la nostra salsa BBQ secreta', price: 11.90, category: '🍔 Vurguers', imageUrl: '', isAvailable: true },

            // 🌯 VURRITOS (8)
            { id: 9, name: 'El Valencià', description: 'Espinacs, pinyons, panses i tofu fumat a la planxa', price: 8.50, category: '🌯 Vurritos', imageUrl: '', isAvailable: true },
            { id: 10, name: 'Mèxic Lliure', description: 'Fesols negres, guacamole casolà, arròs integral i pico de gallo', price: 8.90, category: '🌯 Vurritos', imageUrl: '', isAvailable: true },
            { id: 11, name: 'Vurrito Curry', description: 'Heura al curry, llet de coco, carlota i anacards', price: 9.20, category: '🌯 Vurritos', imageUrl: '', isAvailable: true },
            { id: 12, name: 'Mediterranean Roll', description: 'Hummus de remolatxa, olives negres, falafel i cogombre', price: 8.70, category: '🌯 Vurritos', imageUrl: '', isAvailable: true },
            { id: 13, name: 'Poblat de Mar', description: 'Tofu estil "peix", algues nuri, arròs i salsa tàrtara vegana', price: 9.50, category: '🌯 Vurritos', imageUrl: '', isAvailable: true },
            { id: 14, name: 'Vurrito Barbacoa', description: 'Soja texturitzada, dacsa, ceba roja i salsa barbacoa', price: 8.90, category: '🌯 Vurritos', imageUrl: '', isAvailable: true },
            { id: 15, name: 'L’Esmorzaret', description: 'Rebolicat de tofu, "bacon" de coco i tomàquet ratllat', price: 7.90, category: '🌯 Vurritos', imageUrl: '', isAvailable: true },
            { id: 16, name: 'Pesto i Seitan', description: 'Seitan a tires, formatge vegà, alfàbrega i nous', price: 9.10, category: '🌯 Vurritos', imageUrl: '', isAvailable: true },

            // 🍟 ACOMPANYAMENTS (4)
            { id: 17, name: 'Braves Vurger', description: 'Creïlles al forn amb allioli suau i salsa brava casolana', price: 5.50, category: '🍟 Acompanyaments', imageUrl: '', isAvailable: true },
            { id: 18, name: 'Bastonets de Polenta', description: 'Polenta cruixent amb herbes aromàtiques i maionesa de llimona', price: 5.90, category: '🍟 Acompanyaments', imageUrl: '', isAvailable: true },
            { id: 19, name: 'Nuggets de Coliflor', description: 'Coliflor arrebossada amb panko i salsa agredolça', price: 6.20, category: '🍟 Acompanyaments', imageUrl: '', isAvailable: true },
            { id: 20, name: 'Ensalsada de l’Horta', description: 'Tomàquet valencià, ceba de la vora i oli d’oliva verge extra', price: 4.50, category: '🍟 Acompanyaments', imageUrl: '', isAvailable: true },

            // 🥤 BEGUDES (6)
            { id: 21, name: 'Orxata Artesana', description: 'D.O. Alboraya, ben freda i sense sucre afegit', price: 3.50, category: '🥤 Begudes', imageUrl: '', isAvailable: true },
            { id: 22, name: 'Kombucha de Llimona', description: 'Fermentat natural de te amb un toc cítric refrescant', price: 3.80, category: '🥤 Begudes', imageUrl: '', isAvailable: true },
            { id: 23, name: 'Suc de Taronja', description: 'Taronges valencianes acabades d’esprémer', price: 3.00, category: '🥤 Begudes', imageUrl: '', isAvailable: true },
            { id: 24, name: 'Aigua de l’Avellà', description: 'Aigua mineral natural de font valenciana', price: 1.50, category: '🥤 Begudes', imageUrl: '', isAvailable: true },
            { id: 25, name: 'Cervesa Artesana', description: 'IPA local, elaborada amb ingredients naturals', price: 4.20, category: '🥤 Begudes', imageUrl: '', isAvailable: true },
            { id: 26, name: 'Llimonada de la Casa', description: 'Llimona, menta fresca i un polsim de gingebre', price: 2.80, category: '🥤 Begudes', imageUrl: '', isAvailable: true }
          ],
          isLoading: false
        });
      }, 500);
    }
  }))
);
