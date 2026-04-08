import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MenuStore } from '../menu/menu.store';
import { PaymentMethod } from '../../shared/models/enums/payment-method.enum'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  store = inject(MenuStore);
  private route = inject(ActivatedRoute);

  // Signals para capturar los datos del usuario
  paymentMethod = signal<PaymentMethod>(PaymentMethod.APP);
  customerComment = signal<string>('');

  // Exponemos el enum al template
  PaymentMethod = PaymentMethod;

  ngOnInit() {
    const tableParam = this.route.snapshot.queryParamMap.get('table');

    if (tableParam) {
      const id = parseInt(tableParam, 10);
      if (!isNaN(id)) {
        this.store.setTableId(id);
      }
    } else {
      // Si no hay mesa (Take Away), forzamos pago por APP obligatoriamente
      this.paymentMethod.set(PaymentMethod.APP);
    }
  }

  submitOrder() {
    this.store.sendOrder({
      paymentMethod: this.paymentMethod(),
      customerComment: this.customerComment(),
    });
  }
}
