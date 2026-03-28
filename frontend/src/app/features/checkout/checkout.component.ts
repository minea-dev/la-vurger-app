import { Component } from '@angular/core';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold">Checkout (TPV)</h1>
      <p>Ací estaran el carret i els productes</p>
    </div>
  `
})
export class CheckoutComponent {}
