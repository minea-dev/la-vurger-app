import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FavoritesService } from '@shared/core/services/favorites.service';
import { CartStore, ProductDTO } from '@shared';
import { MenuStore } from '../menu/menu.store';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CurrencyPipe, NgClass, RouterLink],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent implements OnInit {
  private favoritesService = inject(FavoritesService);
  private router = inject(Router);
  cartStore = inject(CartStore);
  menuStore = inject(MenuStore);

  favorites: ProductDTO[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.isLoading = true;
    this.favoritesService.getFavorites().subscribe({
      next: (data: ProductDTO[]) => {
        this.favorites = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  removeFavorite(productId: number) {
    this.favorites = this.favorites.filter((p) => p.id !== productId);
    this.menuStore.toggleFavorite(productId);
  }

  getQuantity(productId: number): number {
    const item = this.cartStore.cart().find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  }

  backToMenu() {
    sessionStorage.removeItem('vurger_keep_menu_open');
    this.router.navigate(['/menu']);
  }
}
