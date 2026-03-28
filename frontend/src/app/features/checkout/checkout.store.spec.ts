import { TestBed } from '@angular/core/testing';
import { CheckoutStore } from './checkout.store';
import { ProductDTO } from '../../shared/models/dtos/product.dto';

describe('CheckoutStore', () => {
  let store: any;

  const mockProduct1: ProductDTO = {
    id: 1, name: 'La Clàssica', price: 10, category: '🍔 Vurguers',
    description: '', imageUrl: '', isAvailable: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheckoutStore]
    });
    store = TestBed.inject(CheckoutStore);
  });

  it('should initialize with an empty cart and null tableId', () => {
    expect(store.cart()).toEqual([]);
    expect(store.tableId()).toBeNull();
    expect(store.cartTotal()).toBe(0);
  });

  it('should set the tableId correctly', () => {
    store.setTableId(5);
    expect(store.tableId()).toBe(5);
  });

  it('should add a product to the cart and update the total', () => {
    store.addToCart(mockProduct1);
    expect(store.cart().length).toBe(1);
    expect(store.cartTotal()).toBe(10);
  });

  it('should completely empty the cart with clearCart()', () => {
    store.addToCart(mockProduct1);
    store.clearCart();
    expect(store.cart()).toEqual([]);
    expect(store.cartTotal()).toBe(0);
  });
});
