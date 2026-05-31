import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, forkJoin } from 'rxjs';

import { OrderDTO } from '@shared/models/dtos/order.dto';
import { OrderStatus } from '@shared/models/enums/order-status.enum';
import { OrderService, StompService } from '@shared';

@Component({
  selector: 'app-kitchen-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kitchen-dashboard.component.html',
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
export class KitchenDashboardComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private stompService = inject(StompService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  orders: OrderDTO[] = [];
  private wsSubscription?: Subscription;
  private timerInterval?: any;
  OrderStatus = OrderStatus;

  selectedOrderForModal: OrderDTO | null = null;
  orderIdForCancelModal: number | null = null;

  private alertSound = new Audio('/assets/sounds/new-order.mp3');
  recentlyAddedOrderIds: Set<number> = new Set();

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

    this.timerInterval = setInterval(() => {
      this.orders = this.orders.map(o => {
        if (o.orderType === 'TAKEAWAY' && o.estimatedTime != null && o.estimatedTime > 0) {
          return { ...o, estimatedTime: o.estimatedTime - 1 };
        }
        return o;
      });
      this.cdr.detectChanges();
    }, 60000);
  }

  loadInitialOrders() {
    forkJoin({
      received: this.orderService.getOrders(OrderStatus.RECEIVED),
      preparing: this.orderService.getOrders(OrderStatus.PREPARING),
      ready: this.orderService.getOrders(OrderStatus.READY),
    }).subscribe({
      next: (res) => {
        this.orders = [...res.received, ...res.preparing, ...res.ready];
        this.cdr.detectChanges();
      },
    });
  }

  connectToWebSockets() {
    this.wsSubscription = this.stompService.watch('/topic/orders').subscribe((message) => {
      this.ngZone.run(() => {
        const updatedOrder: OrderDTO = JSON.parse(message.body);
        this.handleIncomingOrder(updatedOrder);
      });
    });
  }

  handleIncomingOrder(newOrder: OrderDTO) {
    const index = this.orders.findIndex((o) => o.id === newOrder.id);

    if (index > -1) {
      if (this.orders[index].estimatedTime != null) {
        newOrder.estimatedTime = this.orders[index].estimatedTime;
      }

      if (
        newOrder.status === OrderStatus.DISPATCHED ||
        newOrder.status === OrderStatus.COMPLETED ||
        newOrder.status === OrderStatus.CANCELLED
      ) {
        this.orders = this.orders.filter((o) => o.id !== newOrder.id);
      } else {
        const updatedList = [...this.orders];
        updatedList[index] = newOrder;
        this.orders = updatedList;
      }
    } else {
      if (newOrder.status === OrderStatus.RECEIVED) {
        this.playAlert();
        this.recentlyAddedOrderIds.add(newOrder.id);
        setTimeout(() => {
          this.recentlyAddedOrderIds.delete(newOrder.id);
          this.cdr.detectChanges();
        }, 5000);
      }

      if (
        newOrder.status === OrderStatus.RECEIVED ||
        newOrder.status === OrderStatus.PREPARING ||
        newOrder.status === OrderStatus.READY
      ) {
        this.orders = [...this.orders, newOrder];
      }
    }

    this.cdr.detectChanges();
  }

  private playAlert() {
    this.alertSound.currentTime = 0;
    this.alertSound.play().catch((err) => {
      console.warn('⚠️ El navegador ha bloquejat l\'àudio:', err);
    });
  }

  dispatchOrder(orderId: number) {
    this.orderService.updateOrderStatus(orderId, OrderStatus.DISPATCHED).subscribe();
  }

  hasCustomerInfo(order: any): boolean {
    return !!(order.guestName || order.customerName || order.user?.name || order.guestPhone || order.customerPhone || order.user?.phone || order.guestEmail || order.customerEmail || order.user?.email);
  }

  getCustomerName(order: any): string {
    return order.guestName || order.customerName || order.user?.name || 'No especificat';
  }

  getCustomerPhone(order: any): string {
    return order.guestPhone || order.customerPhone || order.user?.phone || 'No especificat';
  }

  getCustomerEmail(order: any): string {
    return order.guestEmail || order.customerEmail || order.user?.email || '';
  }

  openInfoModal(order: OrderDTO) { this.selectedOrderForModal = order; this.cdr.detectChanges(); }
  closeInfoModal() { this.selectedOrderForModal = null; this.cdr.detectChanges(); }
  triggerCancelConfirmation(id: number) { this.orderIdForCancelModal = id; this.cdr.detectChanges(); }
  closeCancelModal() { this.orderIdForCancelModal = null; this.cdr.detectChanges(); }

  confirmCancelOrder() {
    if (this.orderIdForCancelModal) {
      this.orderService.updateOrderStatus(this.orderIdForCancelModal, OrderStatus.CANCELLED).subscribe();
      this.closeCancelModal();
    }
  }

  startOrder(id: number) { this.orderService.updateOrderStatus(id, OrderStatus.PREPARING).subscribe(); }
  finishOrder(id: number) { this.orderService.updateOrderStatus(id, OrderStatus.READY).subscribe(); }
  returnOrder(id: number) { this.orderService.updateOrderStatus(id, OrderStatus.PREPARING).subscribe(); }
  cancelOrder(id: number) { this.orderService.updateOrderStatus(id, OrderStatus.CANCELLED).subscribe(); }

  ngOnDestroy() {
    this.wsSubscription?.unsubscribe();
    if (this.timerInterval) clearInterval(this.timerInterval);
  }
}
