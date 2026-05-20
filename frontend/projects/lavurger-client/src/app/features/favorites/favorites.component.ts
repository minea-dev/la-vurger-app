import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '@shared/core/services/favorites.service';
import { CartStore, ProductDTO } from '@shared';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CurrencyPipe, NgClass],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent implements OnInit {
  private favoritesService = inject(FavoritesService);
  private router = inject(Router);
  cartStore = inject(CartStore);

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
    this.favoritesService.removeFavorite(productId).subscribe({
      error: () => this.loadFavorites(),
    });
  }

  getQuantity(productId: number): number {
    const item = this.cartStore.cart().find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  }

  backToMenu() {
    sessionStorage.setItem('vurger_keep_menu_open', 'true');
    this.router.navigate(['/menu']);
  }
}
