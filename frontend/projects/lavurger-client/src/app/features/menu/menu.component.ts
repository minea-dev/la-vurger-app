import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MenuStore } from './menu.store';
import { CartStore } from '@shared';

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
    desserts: 'Postres vegans'
  };

  ngOnInit() {
    this.menuStore.loadProducts();

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
}
