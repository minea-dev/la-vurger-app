import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { OrderDTO } from '@shared/models/dtos/order.dto';
import { OrderStatus } from '@shared/models/enums/order-status.enum';
import { OrderService, StompService } from '@shared';

@Component({
  selector: 'app-kitchen-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kitchen-dashboard.component.html',
})
export class KitchenDashboardComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private stompService = inject(StompService);
  private cdr = inject(ChangeDetectorRef);

  orders: OrderDTO[] = [];
  private wsSubscription?: Subscription;
  OrderStatus = OrderStatus;

  get pendingOrders() {
    return this.orders.filter((o) => o.status === OrderStatus.RECEIVED);
  }
  get inProgressOrders() {
    return this.orders.filter((o) => o.status === OrderStatus.PREPARING);
  }
  get readyOrders() {
    return this.orders.filter((o) => o.status === OrderStatus.READY);
  }

  ngOnInit() {
    this.loadInitialOrders();
    this.connectToWebSockets();
  }

  loadInitialOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data.filter(
          (o) => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED,
        );
        this.cdr.detectChanges();
      },
    });
  }

  connectToWebSockets() {
    this.wsSubscription = this.stompService.watch('/topic/orders').subscribe((message) => {
      const updatedOrder: OrderDTO = JSON.parse(message.body);
      this.handleIncomingOrder(updatedOrder);
    });
  }

  handleIncomingOrder(newOrder: OrderDTO) {
    const index = this.orders.findIndex((o) => o.id === newOrder.id);

    if (index > -1) {
      if (newOrder.status === OrderStatus.COMPLETED || newOrder.status === OrderStatus.CANCELLED) {
        this.orders.splice(index, 1);
      } else {
        this.orders[index] = newOrder;
      }
    } else {
      if (newOrder.status !== OrderStatus.COMPLETED && newOrder.status !== OrderStatus.CANCELLED) {
        this.orders.push(newOrder);
      }
    }

    this.cdr.detectChanges();
  }

  startOrder(id: number) {
    this.orderService.updateOrderStatus(id, OrderStatus.PREPARING).subscribe();
  }

  finishOrder(id: number) {
    this.orderService.updateOrderStatus(id, OrderStatus.READY).subscribe();
  }

  returnOrder(id: number) {
    this.orderService.updateOrderStatus(id, OrderStatus.PREPARING).subscribe();
  }

  deliverOrder(id: number) {
    this.orderService.updateOrderStatus(id, OrderStatus.COMPLETED).subscribe();
  }

  ngOnDestroy() {
    this.wsSubscription?.unsubscribe();
  }

  cancelOrder(id: number) {
    this.orderService.updateOrderStatus(id, OrderStatus.CANCELLED).subscribe();
  }
}
