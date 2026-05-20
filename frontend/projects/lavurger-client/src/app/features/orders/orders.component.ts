import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderDTO, OrderService } from '@shared';


@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private router = inject(Router);

  orders: OrderDTO[] = [];
  isLoading = true;

  statusLabels: Record<string, string> = {
    RECEIVED: 'Rebuda',
    PENDING: 'Pendent',
    PREPARING: 'A la cuina',
    READY: 'Llest per a recollir',
    COMPLETED: 'Entregat',
    CANCELLED: 'Cancel·lada',
  };

  ngOnInit() {
    this.orderService.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  backToMenu() {
    sessionStorage.setItem('vurger_keep_menu_open', 'true');
    this.router.navigate(['/menu']);
  }
}
