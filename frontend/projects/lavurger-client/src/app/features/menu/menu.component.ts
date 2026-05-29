import { Component, inject, OnInit, signal, effect } from '@angular/core';
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

  isUserMenuOpen = signal(false);
  showLogoutModal = signal(false);
  showLoginToast = signal(false);
  showLogoutToast = signal(false);
  selectedDetailProduct = signal<any | null>(null);

  private isCartInitialized = signal(false);

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

  constructor() {
    effect(() => {
      if (!this.isCartInitialized()) return;

      const currentCart = this.cartStore.cart();
      const email = this.userEmail;

      if (this.isLoggedIn && email) {
        localStorage.setItem(`vurger_cart_${email}`, JSON.stringify(currentCart));
      } else {
        localStorage.setItem('vurger_cart_guest', JSON.stringify(currentCart));
      }
    });
  }

  ngOnInit() {
    this.menuStore.loadProducts();

    if (this.isLoggedIn) {
      this.menuStore.loadFavorites();

      if (!sessionStorage.getItem('vurger_welcome_shown')) {
        this.showLoginToast.set(true);
        sessionStorage.setItem('vurger_welcome_shown', 'true');
        setTimeout(() => {
          this.showLoginToast.set(false);
        }, 4000);
      }
    }

    if (sessionStorage.getItem('vurger_keep_menu_open') === 'true') {
      this.isUserMenuOpen.set(true);
      sessionStorage.removeItem('vurger_keep_menu_open');
    }

    const tableParam = this.route.snapshot.queryParamMap.get('table');
    const savedTable = sessionStorage.getItem('vurger_table');

    if (tableParam) {
      const id = parseInt(tableParam, 10);
      if (!isNaN(id)) {
        sessionStorage.setItem('vurger_table', id.toString());
        this.cartStore.setTableId(id);
      }
    } else if (savedTable) {
      const id = parseInt(savedTable, 10);
      if (!isNaN(id)) {
        this.cartStore.setTableId(id);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { table: savedTable },
          queryParamsHandling: 'merge',
        });
      }
    } else {
      this.cartStore.setTableId(null as any);
    }

    if (sessionStorage.getItem('vurger_clear_cart_needed') === 'true') {
      this.isCartInitialized.set(false);

      const email = this.userEmail;
      if (email) {
        localStorage.removeItem(`vurger_cart_${email}`);
      }
      localStorage.removeItem('vurger_cart_guest');
      this.cartStore.clearCart();

      sessionStorage.removeItem('vurger_clear_cart_needed');
    }

    this.loadPersistedCart();
  }

  private loadPersistedCart() {
    if (this.cartStore.cart().length > 0) {
      if (this.isLoggedIn) {
        localStorage.removeItem('vurger_cart_guest');
      }
      this.isCartInitialized.set(true);
      return;
    }

    this.isCartInitialized.set(false);
    const email = this.userEmail;

    this.cartStore.clearCart();
    let savedCart: string | null = null;

    if (this.isLoggedIn && email) {
      savedCart = localStorage.getItem(`vurger_cart_${email}`);
    } else {
      savedCart = localStorage.getItem('vurger_cart_guest');
    }

    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      for (const item of parsedCart) {
        if (item.product) {
          for (let i = 0; i < item.quantity; i++) {
            this.cartStore.addToCart(item.product);
          }
        }
      }
    }

    this.isCartInitialized.set(true);
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
    if (name && name !== 'undefined' && name !== 'null' && !name.includes('@')) {
      const firstName = name.split(' ')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }
    const email = this.userEmail;
    if (email) {
      const prefix = email.split('@')[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1).toLowerCase();
    }
    return 'Usuari';
  }

  openUserMenu() {
    this.isUserMenuOpen.set(true);
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  navigateToFeature(path: string) {
    sessionStorage.setItem('vurger_keep_menu_open', 'true');
    this.isUserMenuOpen.set(false);
    this.router.navigate([path], { queryParamsHandling: 'preserve' });
  }

  triggerLogout() {
    this.showLogoutModal.set(true);
  }

  cancelLogout() {
    this.showLogoutModal.set(false);
  }

  confirmLogout() {
    const email = this.userEmail;
    const activeCart = this.cartStore.cart();
    if (this.isLoggedIn && email && activeCart.length > 0) {
      localStorage.setItem(`vurger_cart_${email}`, JSON.stringify(activeCart));
    }

    this.isCartInitialized.set(false);

    this.authService.logout();
    this.showLogoutModal.set(false);
    this.isUserMenuOpen.set(false);
    sessionStorage.removeItem('vurger_welcome_shown');
    sessionStorage.removeItem('vurger_keep_menu_open');

    this.cartStore.clearCart();

    this.showLogoutToast.set(true);
    setTimeout(() => {
      this.showLogoutToast.set(false);
    }, 4000);

    this.isCartInitialized.set(true);

    this.router.navigate(['/menu'], { queryParamsHandling: 'preserve' });
  }

  toggleFavorite(event: Event, productId: number) {
    event.stopPropagation();
    this.menuStore.toggleFavorite(productId);
  }

  openProductDetail(product: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedDetailProduct.set(product);
  }

  closeProductDetail() {
    this.selectedDetailProduct.set(null);
  }

  addToCartFromDetail(product: any) {
    this.cartStore.addToCart(product);
    this.closeProductDetail();
  }
}
