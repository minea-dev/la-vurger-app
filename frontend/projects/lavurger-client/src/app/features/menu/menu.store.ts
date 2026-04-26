import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { ProductDTO } from '@shared';
import { ApiService } from '@shared';

type MenuState = {
  products: ProductDTO[];
  categories: string[];
  selectedCategory: string;
  isLoading: boolean;
  searchQuery: string;
};

const initialState: MenuState = {
  products: [],
  categories: ['burgers', 'burritos', 'sides', 'drinks', 'desserts'],
  selectedCategory: 'burgers',
  isLoading: false,
  searchQuery: '',
};

export const MenuStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(({ products, selectedCategory, searchQuery }) => ({
    filteredProducts: computed(() => {
      const category = selectedCategory();
      const query = searchQuery().toLowerCase().trim();

      return products().filter((p) => {
        const catDB = (p.category || '').toLowerCase();
        const matchesCategory = catDB === category;

        const matchesQuery =
          query === ''
            ? true
            : p.name.toLowerCase().includes(query) ||
              (p.description?.toLowerCase().includes(query) ?? false);
        return matchesCategory && matchesQuery && p.isAvailable;
      });
    }),
  })),

  withMethods((store, apiService = inject(ApiService)) => ({
    setSearchQuery(query: string) {
      patchState(store, { searchQuery: query });
    },
    setCategory(category: string) {
      patchState(store, { selectedCategory: category });
    },

    loadProducts() {
      patchState(store, { isLoading: true });
      apiService.getProducts().subscribe({
        next: (productsFromDB) => {
          patchState(store, { products: productsFromDB, isLoading: false });
        },
        error: (err) => {
          console.error('❌ Error loading products:', err);
          patchState(store, { isLoading: false });
        },
      });
    },
  })),
);
