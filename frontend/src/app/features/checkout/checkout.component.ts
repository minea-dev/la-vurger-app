import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CheckoutStore } from './checkout.store';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CurrencyPipe, NgClass],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  store = inject(CheckoutStore);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.store.loadProducts();

    const tableParam = this.route.snapshot.queryParamMap.get('table');
    if (tableParam) {
      const id = parseInt(tableParam, 10);
      if (!isNaN(id)) {
        this.store.setTableId(id);
        console.log(`✅ Context detected: Table ${id}`);
      }
    }
  }

  getQuantity(productId: number): number {
    const item = this.store.cart().find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  }
}
