import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';
import { OrderService, StompService, OrderDTO, OrderStatus, PaymentStatus } from '@shared';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitor.component.html',
  styles: [`
    @keyframes cardFlash {
      0%, 100% { border-color: #e2e8f0; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
      50% { border-color: #2563eb; box-shadow: 0 0 14px rgba(37, 99, 235, 0.35); }
    }
    .animate-new-card {
      animation: cardFlash 1.2s infinite ease-in-out;
    }
  `]
})
export class MonitorComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private stompService = inject(StompService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  orders: OrderDTO[] = [];
  currentFilter: 'ACTIVE' | 'COMPLETED' = 'ACTIVE';
  private wsSubscription?: Subscription;

  OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;

  private alertSound = new Audio('/assets/sounds/new-order.mp3');
  recentlyAddedOrderIds: Set<number> = new Set();

  ngOnInit() {
    this.loadOrders();
    this.connectToWebSockets();
  }

  loadOrders() {
    forkJoin({
      received: this.orderService.getOrders(OrderStatus.RECEIVED),
      preparing: this.orderService.getOrders(OrderStatus.PREPARING),
      ready: this.orderService.getOrders(OrderStatus.READY),
      dispatched: this.orderService.getOrders(OrderStatus.DISPATCHED)
    }).subscribe({
      next: (res) => {
        this.orders = [...res.received, ...res.preparing, ...res.ready, ...res.dispatched];
        this.orders.sort((a, b) => b.id - a.id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error carregant comandes actives:', err),
    });
  }

  loadHistoryLazy() {
    this.orderService.getOrders(OrderStatus.COMPLETED).subscribe({
      next: (completedData) => {
        const activeOrders = this.orders.filter(o => o.status !== OrderStatus.COMPLETED);
        this.orders = [...activeOrders, ...completedData];
        this.orders.sort((a, b) => b.id - a.id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('❌ Error carregant historial passat per caixa:', err)
    });
  }

  connectToWebSockets() {
    this.wsSubscription = this.stompService.watch('/topic/orders').subscribe((message) => {
      this.ngZone.run(() => {
        const updatedOrder: OrderDTO = JSON.parse(message.body);
        const oldOrder = this.orders.find((o) => o.id === updatedOrder.id);
        const index = this.orders.findIndex((o) => o.id === updatedOrder.id);

        const isNewDineIn = !oldOrder && updatedOrder.orderType === 'DINE_IN' && updatedOrder.status === OrderStatus.RECEIVED;

        const isTakeawayInBarra = updatedOrder.orderType === 'TAKEAWAY' && updatedOrder.status === OrderStatus.DISPATCHED && (!oldOrder || oldOrder.status !== OrderStatus.DISPATCHED);

        if (isNewDineIn || isTakeawayInBarra) {
          this.playAlert();
          this.recentlyAddedOrderIds.add(updatedOrder.id);
          setTimeout(() => {
            this.recentlyAddedOrderIds.delete(updatedOrder.id);
            this.cdr.detectChanges();
          }, 5000);
        }

        if (index !== -1) {
          const updatedList = [...this.orders];
          updatedList[index] = updatedOrder;
          this.orders = updatedList;
        } else {
          this.orders = [updatedOrder, ...this.orders];
        }
        this.orders.sort((a, b) => b.id - a.id);
        this.cdr.detectChanges();
      });
    });
  }

  private playAlert() {
    this.alertSound.currentTime = 0;
    this.alertSound.play().catch((err) => console.warn('⚠️ Audio bloquejat:', err));
  }

  get dineInPendingOrders() {
    return this.orders.filter(order =>
      order.orderType === 'DINE_IN' &&
      order.paymentStatus === PaymentStatus.PENDING &&
      (order.status === OrderStatus.READY || order.status === OrderStatus.DISPATCHED)
    );
  }

  get takeawayReadyOrders() {
    return this.orders.filter(order =>
      order.orderType === 'TAKEAWAY' &&
      order.status === OrderStatus.DISPATCHED
    );
  }

  get completedOrdersHistory() {
    const now = new Date().getTime();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    return this.orders.filter((order) => {
      const orderDate = order.createdAt ? new Date(order.createdAt).getTime() : 0;
      const isClosedOrCancelled =
        order.status === OrderStatus.CANCELLED ||
        (order.status === OrderStatus.COMPLETED && order.paymentStatus === PaymentStatus.PAID);

      return isClosedOrCancelled && (now - orderDate <= twentyFourHours);
    });
  }

  get totalActiveCount() {
    return this.dineInPendingOrders.length + this.takeawayReadyOrders.length;
  }

  handleOrderAction(order: OrderDTO) {
    if (order.paymentStatus === PaymentStatus.PENDING) {
      this.orderService.updatePaymentStatus(order.id, PaymentStatus.PAID).subscribe();
    } else {
      this.orderService.updateOrderStatus(order.id, OrderStatus.COMPLETED).subscribe();
    }
  }

  hasCustomerInfo(order: any): boolean { return !!(order.guestName || order.customerName || order.user?.name || order.guestPhone || order.customerPhone || order.user?.phone); }
  getCustomerName(order: any): string { return order.guestName || order.customerName || order.user?.name || 'Client'; }
  getCustomerPhone(order: any): string { return order.guestPhone || order.customerPhone || order.user?.phone || ''; }
  setFilter(filter: 'ACTIVE' | 'COMPLETED') { this.currentFilter = filter; if (filter === 'COMPLETED') { this.loadHistoryLazy(); } }
  ngOnDestroy() { this.wsSubscription?.unsubscribe(); }
}
