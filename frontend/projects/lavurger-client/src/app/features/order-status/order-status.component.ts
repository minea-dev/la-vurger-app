import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, effect } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Subscription } from 'rxjs';
import { OrderStatusStore } from './order-status.store';
import { OrderStatus, StompService, OrderDTO, AuthService, CartStore } from '@shared';
import { MenuStore } from '../menu/menu.store';
import { calculateRemainingMinutes } from '@shared/utils/date-utils';

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [CurrencyPipe, NgClass, RouterLink],
  templateUrl: './order-status.component.html',
  styles: [`
    @keyframes delayFlash {
      0%, 100% { background-color: #dc2626; border-color: #b91c1c; transform: scale(1); }
      50% { background-color: #991b1b; border-color: #7f1d1d; transform: scale(1.02); }
    }
    .animate-delay-blink {
      animation: delayFlash 1s infinite ease-in-out;
    }
  `]
})
export class OrderStatusComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stompService = inject(StompService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private cartStore = inject(CartStore);

  store = inject(OrderStatusStore);
  menuStore = inject(MenuStore);

  OrderStatus = OrderStatus;
  private wsSubscription?: Subscription;
  private redirectTimeout?: any;
  private timerInterval?: any;

  getRemainingMinutes = calculateRemainingMinutes;

  constructor() {
    effect(() => {
      const order = this.store.order();
      if (order && order.status === OrderStatus.COMPLETED) {
        const email = this.authService.getCurrentEmail();
        if (email) {
          localStorage.removeItem(`vurger_cart_${email}`);
        }
        localStorage.removeItem('vurger_cart_guest');
        this.cartStore.clearCart();
        console.log('✨ Comanda completada amb èxit: LocalStorage netejat.');
      }
    });

    effect(() => {
      const order = this.store.order();
      if (!order) return;

      if (this.redirectTimeout) { clearTimeout(this.redirectTimeout); }

      if (order.status === OrderStatus.COMPLETED) {
        this.redirectTimeout = setTimeout(() => {
          this.resetMenuAndNavigate();
        }, 5000);
      } else if (order.status === OrderStatus.CANCELLED) {
        this.redirectTimeout = setTimeout(() => {
          this.resetMenuAndNavigate();
        }, 180000);
      } else if (order.orderType === 'DINE_IN' && order.status === OrderStatus.DISPATCHED) {
        this.redirectTimeout = setTimeout(() => {
          this.resetMenuAndNavigate();
        }, 8000);
      }
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.store.loadOrder(id);
        this.connectToWebSockets(id);
        this.timerInterval = setInterval(() => {
          this.cdr.detectChanges();
        }, 15000);
      }
    }
  }

  connectToWebSockets(orderId: number) {
    this.wsSubscription = this.stompService.watch('/topic/orders').subscribe((message) => {
      const updatedOrder: OrderDTO = JSON.parse(message.body);
      if (updatedOrder.id === orderId) {
        this.store.updateOrder(updatedOrder);
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
