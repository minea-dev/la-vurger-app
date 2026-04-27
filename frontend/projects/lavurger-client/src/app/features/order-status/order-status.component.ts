import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { OrderStatusStore } from './order-status.store';
import { OrderStatus, StompService, OrderDTO } from '@shared';
import { MenuStore } from '../menu/menu.store';

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [CurrencyPipe, NgClass, RouterLink],
  templateUrl: './order-status.component.html',
})
export class OrderStatusComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stompService = inject(StompService);

  store = inject(OrderStatusStore);
  menuStore = inject(MenuStore);

  OrderStatus = OrderStatus;
  private wsSubscription?: Subscription;
  private redirectTimeout?: any;

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.store.loadOrder(id);
        this.connectToWebSockets(id);
      }
    }
  }

  connectToWebSockets(orderId: number) {
    this.wsSubscription = this.stompService.watch('/topic/orders').subscribe((message) => {
      const updatedOrder: OrderDTO = JSON.parse(message.body);
      if (updatedOrder.id === orderId) {
        this.store.updateOrder(updatedOrder);

        if (updatedOrder.status === OrderStatus.COMPLETED) {
          this.redirectTimeout = setTimeout(() => {
            this.resetMenuAndNavigate();
          }, 5000);
        } else if (updatedOrder.status === OrderStatus.CANCELLED) {
          this.redirectTimeout = setTimeout(() => {
            this.resetMenuAndNavigate();
          }, 180000);
        }
      }
    });
  }

  resetMenuAndNavigate() {
    const savedTable = sessionStorage.getItem('vurger_table');
    this.menuStore.setCategory('burgers');
    this.menuStore.setSearchQuery('');

    this.router.navigate(['/menu'], {
      queryParams: savedTable ? { table: savedTable } : {},
      queryParamsHandling: 'merge'
    });
  }

  ngOnDestroy() {
    this.wsSubscription?.unsubscribe();
    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }
  }

  getStepStatus(status: OrderStatus, stepIndex: number): 'done' | 'active' | 'pending' {
    const states = [
      OrderStatus.RECEIVED,
      OrderStatus.PREPARING,
      OrderStatus.READY,
      OrderStatus.COMPLETED,
    ];
    const currentIndex = states.indexOf(status);

    if (currentIndex === -1) return 'pending';
    if (currentIndex > stepIndex) return 'done';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  }
}
