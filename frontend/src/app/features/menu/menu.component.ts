import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MenuStore } from './menu.store';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CurrencyPipe, NgClass, RouterLink],
  templateUrl: './menu.component.html',
})
export class MenuComponent implements OnInit {
  store = inject(MenuStore);
  private route = inject(ActivatedRoute);

  categoryNames: Record<string, string> = {
    burgers: '🍔 Vurguers',
    burritos: '🌯 Vurritos',
    sides: '🍟 Acompanyaments',
    drinks: '🥤 Begudes',
  };

  categoryLabels: Record<string, string> = {
    burgers: 'Les nostres clàssiques',
    burritos: "Vurritos de l'horta",
    sides: 'Per acompanyar',
    drinks: 'Begudes fresques',
  };

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
    const item = this.store.cart().find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  }
}
