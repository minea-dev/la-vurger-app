import { Component } from '@angular/core';

@Component({
  selector: 'app-kitchen',
  standalone: true,
  imports: [],
  template: `
    <div class="p-4 bg-gray-900 text-white min-h-screen">
      <h1 class="text-2xl font-bold">Kitchen Dashboard</h1>
      <p>Ací estarn els tickets de les comandes en temps real</p>
    </div>
  `
})
export class KitchenComponent {}
