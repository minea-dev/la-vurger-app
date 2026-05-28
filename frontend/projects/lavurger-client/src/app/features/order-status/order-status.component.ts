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

  private timerInterval?: any;
  private lastTickTime: number = Date.now();

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.store.loadOrder(id);
        this.connectToWebSockets(id);

        this.lastTickTime = Date.now();
        this.timerInterval = setInterval(() => {
          const now = Date.now();
          const elapsedMs = now - this.lastTickTime;

          if (elapsedMs >= 60000) {
            const elapsedMins = Math.floor(elapsedMs / 60000);
            this.lastTickTime += (elapsedMins * 60000);

            const currentOrder = this.store.order();
            if (currentOrder && currentOrder.estimatedTime != null && currentOrder.estimatedTime > 0) {
              this.store.updateOrder({
                ...currentOrder,
                estimatedTime: Math.max(0, currentOrder.estimatedTime - elapsedMins)
              });
            }
          }
        }, 1000);
      }
    }
  }

  connectToWebSockets(orderId: number) {
    this.wsSubscription = this.stompService.watch('/topic/orders').subscribe((message) => {
      const updatedOrder: OrderDTO = JSON.parse(message.body);
      if (updatedOrder.id === orderId) {

        const currentOrder = this.store.order();
        if (currentOrder && currentOrder.estimatedTime != null) {
          updatedOrder.estimatedTime = currentOrder.estimatedTime;
        }

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
    if (this.redirectTimeout) { clearTimeout(this.redirectTimeout); }
    if (this.timerInterval) { clearInterval(this.timerInterval); }
  }

  isCustomerPreparing(order: OrderDTO): boolean {
    if (order.orderType === 'TAKEAWAY') {
      return order.status === OrderStatus.PREPARING || order.status === OrderStatus.READY;
    }
    return order.status === OrderStatus.PREPARING;
  }

  isCustomerReady(order: OrderDTO): boolean {
    if (order.orderType === 'TAKEAWAY') {
      return order.status === OrderStatus.DISPATCHED || order.status === OrderStatus.COMPLETED;
    }
    return order.status === OrderStatus.READY || order.status === OrderStatus.DISPATCHED || order.status === OrderStatus.COMPLETED;
  }

  getStepStatus(order: OrderDTO, stepIndex: number): 'done' | 'active' | 'pending' {
    let currentIndex = -1;

    if (order.status === OrderStatus.RECEIVED) currentIndex = 0;
    else if (order.status === OrderStatus.COMPLETED) currentIndex = 3;
    else if (this.isCustomerPreparing(order)) currentIndex = 1;
    else if (this.isCustomerReady(order)) currentIndex = 2;

    if (currentIndex === -1) return 'pending';
    if (currentIndex >= stepIndex) return 'done';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  }
}
