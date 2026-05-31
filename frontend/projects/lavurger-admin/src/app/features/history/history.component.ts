import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, OrderDTO, OrderStatus, PaymentStatus } from '@shared';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
})
export class HistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);

  orders: OrderDTO[] = [];
  isHistoryLoading = false;
  selectedOrder: OrderDTO | null = null;
  filterType: 'day' | 'range' = 'day';
  filterDate: string = '';
  startDate: string = '';
  endDate: string = '';

  OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;

  translatedStatuses: Partial<Record<OrderStatus, string>> = {
    [OrderStatus.RECEIVED]: 'Rebuda',
    [OrderStatus.PREPARING]: 'En preparació',
    [OrderStatus.READY]: 'Llest',
    [OrderStatus.COMPLETED]: 'Completada',
    [OrderStatus.DISPATCHED]: 'Lliurat',
    [OrderStatus.CANCELLED]: 'Cancel·lada'
  };

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isHistoryLoading = true;
    this.cdr.detectChanges();

    let historyObservable$;

    if (this.filterType === 'range' && this.startDate && this.endDate) {
      historyObservable$ = this.orderService.getHistoryAdmin(undefined, this.startDate, this.endDate);
    } else if (this.filterType === 'day' && this.filterDate) {
      historyObservable$ = this.orderService.getHistoryAdmin(this.filterDate);
    } else {
      historyObservable$ = this.orderService.getHistoryAdmin();
    }

    historyObservable$.subscribe({
      next: (data) => {
        this.orders = data || [];
        this.isHistoryLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading history:', err);
        this.isHistoryLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onDateChange() {
    if (this.filterType === 'range' && (!this.startDate || !this.endDate)) {
      return;
    }
    this.loadOrders();
  }

  clearFilter() {
    this.filterDate = '';
    this.startDate = '';
    this.endDate = '';
    this.loadOrders();
  }

  getCustomerType(order: OrderDTO): 'USER' | 'GUEST' | 'ANONYMOUS' {
    if (order.customerName || order.customerPhone) return 'USER';
    if (order.guestName) return 'GUEST';
    return 'ANONYMOUS';
  }

  getCustomerName(order: OrderDTO): string {
    if (order.customerName) return order.customerName;
    if (order.guestName) return order.guestName;
    return order.orderType === 'DINE_IN' ? `Taula ${order.tableId}` : 'Anònim';
  }

  openDetails(order: OrderDTO) {
    this.selectedOrder = order;
    this.cdr.detectChanges();
  }

  closeDetails() {
    this.selectedOrder = null;
    this.cdr.detectChanges();
  }
}
