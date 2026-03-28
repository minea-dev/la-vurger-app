import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { CheckoutStore } from './checkout.store';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, NgClass],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  store = inject(CheckoutStore);

  ngOnInit() {
    this.store.loadProducts();
  }

  getQuantity(productId: number): number {
    const item = this.store.cart().find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  }
}
