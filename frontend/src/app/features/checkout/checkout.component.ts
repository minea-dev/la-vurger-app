import { Component, inject, OnInit } from '@angular/core';
import { CheckoutStore } from './checkout.store';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  store = inject(CheckoutStore);

  ngOnInit() {
    this.store.loadProducts();
  }
}
