import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { OrderStatusStore } from './order-status.store';
import { OrderStatus } from '../../../../../shared/src/lib/models/enums/order-status.enum';

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [CurrencyPipe, NgClass, RouterLink],
  templateUrl: './order-status.component.html',
})
export class OrderStatusComponent implements OnInit {
  private route = inject(ActivatedRoute);
  store = inject(OrderStatusStore);

  OrderStatus = OrderStatus;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.store.loadOrder(id);
      }
    }
  }

  getStepStatus(status: OrderStatus, stepIndex: number): 'done' | 'active' | 'pending' {
    const states = [OrderStatus.RECEIVED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.COMPLETED];
    const currentIndex = states.indexOf(status);

    if (currentIndex === -1) return 'pending';
    if (currentIndex > stepIndex) return 'done';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  }
}
