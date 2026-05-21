import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { PaymentMethod } from '@shared';
import { CheckoutStore } from './checkout.store';
import { CartStore } from '@shared';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  checkoutStore = inject(CheckoutStore);
  cartStore = inject(CartStore);

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  paymentMethod = signal<PaymentMethod>(PaymentMethod.APP);
  customerComment = signal<string>('');

  PaymentMethod = PaymentMethod;

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
    this.checkoutStore.sendOrder({
      paymentMethod: this.paymentMethod(),
      customerComment: this.customerComment(),
    });
  }

  backToMenu() {
    sessionStorage.removeItem('vurger_keep_menu_open');
    this.router.navigate(['/menu'], { queryParamsHandling: 'preserve' });
  }
}
