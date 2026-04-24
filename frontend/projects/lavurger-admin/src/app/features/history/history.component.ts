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
  filterDate: string = '';

  OrderStatus = OrderStatus;
  PaymentStatus = PaymentStatus;

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        // Guardamos y ordenamos
        this.orders = (data || []).sort((a, b) => (b.id || 0) - (a.id || 0));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error carregant històric:', err);
        this.cdr.detectChanges();
      },
    });
  }

  get filteredOrders() {
    if (!this.filterDate) return this.orders;

    return this.orders.filter((order) => {
      if (!order.createdAt) return false;
      const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
      return orderDateStr === this.filterDate;
    });
  }
}
