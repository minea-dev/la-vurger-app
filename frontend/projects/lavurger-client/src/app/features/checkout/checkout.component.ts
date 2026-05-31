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
  guestPhone = signal<string>('');
  showGuestForm = signal<boolean>(false);

  guestNameTouched = signal<boolean>(false);
  guestPhoneTouched = signal<boolean>(false);

  cardNumber = signal<string>('');
  cardExpiry = signal<string>('');
  cardCvc = signal<string>('');
  isStripeProcessing = signal<boolean>(false);

  showErrorModal = signal<boolean>(false);
  errorMessage = signal<string>('');

  PaymentMethod = PaymentMethod;

  isGuestNameInvalid = computed(() => {
    const name = this.guestName().trim();
    if (name.length === 0) return false;
    return name.length < 3 || name.length > 50 || !/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(name);
  });

  isGuestPhoneInvalid = computed(() => {
    const phone = this.guestPhone().trim();
    if (phone.length === 0) return false;
    return !/^[0-9]{9}$/.test(phone);
  });

  isStripeFormInvalid = computed(() => {
    if (this.paymentMethod() !== PaymentMethod.APP) return false;

    const num = this.cardNumber().replace(/\s/g, '');
    const exp = this.cardExpiry().trim();
    const cvc = this.cardCvc().trim();

    return num.length < 16 || exp.length < 5 || cvc.length < 3;
  });

  isFormInvalid = computed(() => {
    if (this.authService.isLoggedIn()) return false;
    if (this.cartStore.tableId()) return false;
    if (!this.showGuestForm()) return true;

    const name = this.guestName().trim();
    const phone = this.guestPhone().trim();

    const nameValid = name.length >= 3 && name.length <= 50 && /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/.test(name);
    const phoneValid = /^[0-9]{9}$/.test(phone);

    return !nameValid || !phoneValid;
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

  async submitOrder() {
    if (this.paymentMethod() === PaymentMethod.APP) {
      this.isStripeProcessing.set(true);

      await new Promise(resolve => setTimeout(resolve, 1800));
      this.isStripeProcessing.set(false);
    }

    sessionStorage.setItem('vurger_clear_cart_needed', 'true');

    const payload: any = {
      paymentMethod: this.paymentMethod(),
      customerComment: this.customerComment(),
    };

    if (!this.authService.isLoggedIn() && !this.cartStore.tableId()) {
      payload.guestName = this.guestName().trim();
      payload.guestPhone = this.guestPhone().trim();
      payload.guestEmail = 'convidat@lavurger.com';
    }

    try {
      await this.checkoutStore.sendOrder(payload);
    } catch (err: any) {
      console.error('❌ Error enviant la comanda:', err);

      const isBadRequest = err.status === 400;
      this.errorMessage.set(
        isBadRequest
          ? "Les dades de contacte són incorrectes. Revisa'n el format."
          : 'Hi ha hagut un problema amb el servidor. Siusplau, avisa un cambrer o intenta-ho de nou més tard.',
      );

      this.showErrorModal.set(true);
    }
  }

  get userName(): string {
    return this.authService.getCurrentName() || 'Client';
  }

  get userPhone(): string {
    return this.authService.getCurrentPhone() || 'No informat';
  }

  backToMenu() {
    sessionStorage.removeItem('vurger_keep_menu_open');
    this.router.navigate(['/menu'], { queryParamsHandling: 'preserve' });
  }
}
