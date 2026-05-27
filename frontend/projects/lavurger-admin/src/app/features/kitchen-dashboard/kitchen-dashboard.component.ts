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
})
export class KitchenDashboardComponent implements OnInit, OnDestroy {
  private orderService = inject(OrderService);
  private stompService = inject(StompService);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  orders: OrderDTO[] = [];
  private wsSubscription?: Subscription;
  OrderStatus = OrderStatus;

  selectedOrderForModal: OrderDTO | null = null;
  orderIdForCancelModal: number | null = null;

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
      if (newOrder.status === OrderStatus.COMPLETED || newOrder.status === OrderStatus.CANCELLED) {
        this.orders = this.orders.filter((o) => o.id !== newOrder.id);
      } else {
        const updatedList = [...this.orders];
        updatedList[index] = newOrder;
        this.orders = updatedList;
      }
    } else {
      if (newOrder.status !== OrderStatus.COMPLETED && newOrder.status !== OrderStatus.CANCELLED) {
        this.orders = [...this.orders, newOrder];
      }
    }

    this.cdr.detectChanges();
  }

  hasCustomerInfo(order: any): boolean {
    return !!(
      order.guestName ||
      order.customerName ||
      order.user?.name ||
      order.guestPhone ||
      order.customerPhone ||
      order.user?.phone ||
      order.guestEmail ||
      order.customerEmail ||
      order.user?.email
    );
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

  openInfoModal(order: OrderDTO) {
    this.selectedOrderForModal = order;
    this.cdr.detectChanges();
  }

  closeInfoModal() {
    this.selectedOrderForModal = null;
    this.cdr.detectChanges();
  }

  triggerCancelConfirmation(id: number) {
    this.orderIdForCancelModal = id;
    this.cdr.detectChanges();
  }

  closeCancelModal() {
    this.orderIdForCancelModal = null;
    this.cdr.detectChanges();
  }

  confirmCancelOrder() {
    if (this.orderIdForCancelModal) {
      this.cancelOrder(this.orderIdForCancelModal);
      this.closeCancelModal();
    }
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

  cancelOrder(id: number) {
    this.orderService.updateOrderStatus(id, OrderStatus.CANCELLED).subscribe();
  }

  ngOnDestroy() {
    this.wsSubscription?.unsubscribe();
  }
}
