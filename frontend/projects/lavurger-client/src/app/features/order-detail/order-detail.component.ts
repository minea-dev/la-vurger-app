import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CartStore, OrderDTO, OrderService } from '@shared';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  cartStore = inject(CartStore);

  order: OrderDTO | null = null;
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderService.getOrderById(Number(id)).subscribe({
        next: (data) => {
          this.order = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.isLoading = false;
        },
      });
    }
  }

  repeatOrder() {
    if (!this.order || !this.order.items) return;

    for (const item of this.order.items) {
      if (item.product) {
        for (let i = 0; i < item.quantity; i++) {
          this.cartStore.addToCart(item.product);
        }
      }
    }

    this.router.navigate(['/checkout']);
  }

  backToOrders() {
    this.router.navigate(['/orders']);
  }
}
