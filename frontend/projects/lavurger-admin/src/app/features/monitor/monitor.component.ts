import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { OrderService, StompService, OrderDTO, OrderStatus, PaymentStatus } from '@shared';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitor.component.html',
})
export class MonitorComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private stompService = inject(StompService);
  private cdr = inject(ChangeDetectorRef);

  orders: OrderDTO[] = [];
  currentFilter: 'PENDING_PAY' | 'COMPLETED' = 'PENDING_PAY';
  private wsSubscription?: Subscription;

  OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;

  ngOnInit() {
    this.loadOrders();
    this.connectToWebSockets();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.orders.sort((a, b) => b.id - a.id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error carregant comandes:', err),
    });
  }

  connectToWebSockets() {
    this.wsSubscription = this.stompService.watch('/topic/orders').subscribe((message) => {
      const updatedOrder: OrderDTO = JSON.parse(message.body);
      const index = this.orders.findIndex((o) => o.id === updatedOrder.id);
      if (index !== -1) {
        this.orders[index] = updatedOrder;
      } else {
        this.orders.unshift(updatedOrder);
      }
      this.orders.sort((a, b) => b.id - a.id);
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.wsSubscription?.unsubscribe();
  }

  // 🚨 EL MÉTODO QUE FALTABA
  setFilter(filter: 'PENDING_PAY' | 'COMPLETED') {
    this.currentFilter = filter;
  }

  get filteredOrders() {
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    return this.orders.filter((order) => {
      if (order.status === OrderStatus.RECEIVED || order.status === OrderStatus.PREPARING)
        return false;

      const isPending =
        order.paymentStatus === PaymentStatus.PENDING && order.status !== OrderStatus.CANCELLED;

      if (this.currentFilter === 'PENDING_PAY') {
        return isPending;
      }

      if (this.currentFilter === 'COMPLETED') {
        const orderDate = order.createdAt ? new Date(order.createdAt).getTime() : 0;
        return !isPending && now - orderDate <= twentyFourHours;
      }
      return false;
    });
  }

  get pendingPaymentCount() {
    return this.orders.filter(
      (o) =>
        o.paymentStatus === PaymentStatus.PENDING &&
        o.status !== OrderStatus.CANCELLED &&
        (o.status === OrderStatus.READY || o.status === OrderStatus.COMPLETED),
    ).length;
  }

  markAsPaid(id: number) {
    this.orderService.updatePaymentStatus(id, PaymentStatus.PAID).subscribe();
  }

  deliverOrder(id: number) {
    this.orderService.updateOrderStatus(id, OrderStatus.COMPLETED).subscribe();
  }
}
