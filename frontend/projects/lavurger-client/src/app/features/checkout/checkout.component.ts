import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { PaymentMethod } from '../../../../../shared/src/lib/models/enums/payment-method.enum';
import { CheckoutStore } from './checkout.store';
import { CartStore } from '../../../../../shared/src/lib/core/store/cart.store';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  checkoutStore = inject(CheckoutStore);
  cartStore = inject(CartStore);

  private route = inject(ActivatedRoute);

  paymentMethod = signal<PaymentMethod>(PaymentMethod.APP);
  customerComment = signal<string>('');

  PaymentMethod = PaymentMethod;

  ngOnInit() {
    const tableParam = this.route.snapshot.queryParamMap.get('table');

    if (tableParam) {
      const id = parseInt(tableParam, 10);
      if (!isNaN(id)) {
        this.cartStore.setTableId(id);
      }
    } else {
      this.paymentMethod.set(PaymentMethod.APP);
    }
  }

  submitOrder() {
    this.checkoutStore.sendOrder({
      paymentMethod: this.paymentMethod(),
      customerComment: this.customerComment(),
    });
  }
}
