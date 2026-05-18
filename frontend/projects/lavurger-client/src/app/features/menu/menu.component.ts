import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuStore } from './menu.store';
import { CartStore, AuthService } from '@shared';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CurrencyPipe, NgClass, RouterLink],
  templateUrl: './menu.component.html',
})
export class MenuComponent implements OnInit {
  menuStore = inject(MenuStore);
  cartStore = inject(CartStore);

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  isUserMenuOpen = false;

  categoryNames: Record<string, string> = {
    burgers: '🍔 Vurguers',
    burritos: '🌯 Vurritos',
    sides: '🍟 Acompanyaments',
    drinks: '🥤 Begudes',
    desserts: '🍨 Postres',
  };

  categoryLabels: Record<string, string> = {
    burgers: 'Les nostres clàssiques',
    burritos: "Vurritos de l'horta",
    sides: 'Per acompanyar',
    drinks: 'Begudes fresques',
    desserts: 'Postres vegans',
  };

  ngOnInit() {
    this.menuStore.loadProducts();

    const tableId = this.route.snapshot.queryParamMap.get('table');

    if (tableId) {
      sessionStorage.setItem('vurger_table', tableId);
    }

    const tableParam = this.route.snapshot.queryParamMap.get('table');
    if (tableParam) {
      const id = parseInt(tableParam, 10);
      if (!isNaN(id)) {
        this.cartStore.setTableId(id);
        console.log(`✅ Context detected: Table ${id}`);
      }
    }
  }

  getQuantity(productId: number): number {
    const item = this.cartStore.cart().find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  }

  get userEmail(): string | null {
    return this.authService.getCurrentEmail();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.router.navigate(['/login']);
  }
}
