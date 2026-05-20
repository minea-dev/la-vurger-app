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
  showLogoutModal = false;
  showLoginToast = false;

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

    if (this.isLoggedIn) {
      this.menuStore.loadFavorites();

      if (!sessionStorage.getItem('vurger_welcome_shown')) {
        this.showLoginToast = true;
        sessionStorage.setItem('vurger_welcome_shown', 'true');
        setTimeout(() => {
          this.showLoginToast = false;
        }, 4000);
      }
    }

    if (sessionStorage.getItem('vurger_keep_menu_open') === 'true') {
      this.isUserMenuOpen = true;
      sessionStorage.removeItem('vurger_keep_menu_open');
    }

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

  get userName(): string {
    const name = this.authService.getCurrentName();
    if (!name || name === 'undefined' || name === 'null') {
      const email = this.userEmail;
      return email ? email.split('@')[0] : 'Usuari';
    }
    return name;
  }

  openUserMenu() {
    this.isUserMenuOpen = true;
  }

  closeUserMenu() {
    this.isUserMenuOpen = false;
  }

  navigateToFeature(path: string) {
    sessionStorage.setItem('vurger_keep_menu_open', 'true');
    this.isUserMenuOpen = false;
    this.router.navigate([path]);
  }

  triggerLogout() {
    this.showLogoutModal = true;
  }

  cancelLogout() {
    this.showLogoutModal = false;
  }

  confirmLogout() {
    this.authService.logout();
    this.showLogoutModal = false;
    this.isUserMenuOpen = false;
    sessionStorage.removeItem('vurger_welcome_shown');
    sessionStorage.removeItem('vurger_keep_menu_open');
    this.router.navigate(['/menu']);
  }

  toggleFavorite(event: Event, productId: number) {
    event.stopPropagation();
    this.menuStore.toggleFavorite(productId);
  }
}
