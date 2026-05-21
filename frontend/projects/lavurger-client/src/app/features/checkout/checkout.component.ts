import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { PaymentMethod, CartStore, AuthService } from '@shared';
import { CheckoutStore } from './checkout.store';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  checkoutStore = inject(CheckoutStore);
  cartStore = inject(CartStore);
  authService = inject(AuthService);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  paymentMethod = signal<PaymentMethod>(PaymentMethod.APP);
  customerComment = signal<string>('');

  guestName = signal<string>('');
  guestEmail = signal<string>('');
  guestPhone = signal<string>('');
  showGuestForm = signal<boolean>(false);

  PaymentMethod = PaymentMethod;

  isFormInvalid = computed(() => {
    if (this.authService.isLoggedIn()) return false;
    if (this.cartStore.tableId()) return false;
    return (
      !this.showGuestForm() ||
      !this.guestName().trim() ||
      !this.guestEmail().trim() ||
      !this.guestPhone().trim()
    );
  });

  ngOnInit() {
    sessionStorage.removeItem('vurger_keep_menu_open');

    let tableParam = this.route.snapshot.queryParamMap.get('table');
    if (!tableParam) {
      tableParam = sessionStorage.getItem('vurger_table');
    }
    if (tableParam) {
      const id = parseInt(tableParam, 10);
      if (!isNaN(id)) {
        sessionStorage.setItem('vurger_table', id.toString());
        this.cartStore.setTableId(id);
      }
    }

    if (!this.cartStore.tableId()) {
      this.paymentMethod.set(PaymentMethod.APP);
    }
  }

  submitOrder() {
    sessionStorage.setItem('vurger_clear_cart_needed', 'true');

    const payload: any = {
      paymentMethod: this.paymentMethod(),
      customerComment: this.customerComment(),
    };

    if (!this.authService.isLoggedIn() && !this.cartStore.tableId()) {
      payload.guestName = this.guestName().trim();
      payload.guestEmail = this.guestEmail().trim();
      payload.guestPhone = this.guestPhone().trim();
    }

    this.checkoutStore.sendOrder(payload);
  }

  backToMenu() {
    sessionStorage.removeItem('vurger_keep_menu_open');
    this.router.navigate(['/menu'], { queryParamsHandling: 'preserve' });
  }
}
