import { Component, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

interface MockOrder {
  id: number;
  date: Date;
  total: number;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';
  itemsCount: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './orders.component.html',
})
export class OrdersComponent {
  orders: MockOrder[] = [
    { id: 1024, date: new Date(), total: 24.9, status: 'PREPARING', itemsCount: 3 },
    {
      id: 1012,
      date: new Date(Date.now() - 86400000),
      total: 15.5,
      status: 'DELIVERED',
      itemsCount: 2,
    },
    {
      id: 998,
      date: new Date(Date.now() - 86400000 * 3),
      total: 32.1,
      status: 'DELIVERED',
      itemsCount: 4,
    },
  ];

  statusLabels: Record<string, string> = {
    PENDING: 'Pendent',
    PREPARING: 'A la cuina',
    READY: 'Llest per a recollir',
    DELIVERED: 'Entregat',
  };
}
