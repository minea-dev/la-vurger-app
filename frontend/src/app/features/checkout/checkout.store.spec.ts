import { TestBed } from '@angular/core/testing';
import { CheckoutStore } from './checkout.store';
import { ProductDTO } from '../../shared/models/dtos/product.dto';

describe('CheckoutStore', () => {
  let store: any;

  // Mock products for testing
  const mockProduct1: ProductDTO = {
    id: 1, name: 'La Clàssica', price: 10, category: '🍔 Vurguers',
    description: '', imageUrl: '', isAvailable: true
  };
  const mockProduct2: ProductDTO = {
    id: 2, name: 'Braves', price: 5, category: '🍟 Acompanyaments',
    description: '', imageUrl: '', isAvailable: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CheckoutStore]
    });
    store = TestBed.inject(CheckoutStore);
  });

  it('should initialize with an empty cart and total 0', () => {
    expect(store.cart()).toEqual([]);
    expect(store.cartTotal()).toBe(0);
    expect(store.cartItemsCount()).toBe(0);
  });

  it('should add a product to the cart and update the total', () => {
    store.addToCart(mockProduct1);

    expect(store.cart().length).toBe(1);
    expect(store.cart()[0].quantity).toBe(1);
    expect(store.cartTotal()).toBe(10);
    expect(store.cartItemsCount()).toBe(1);
  });

  it('should increment quantity if the product already exists in the cart', () => {
    store.addToCart(mockProduct1);
    store.addToCart(mockProduct1);

    expect(store.cart().length).toBe(1);
    expect(store.cart()[0].quantity).toBe(2);
    expect(store.cartTotal()).toBe(20);
    expect(store.cartItemsCount()).toBe(2);
  });

  it('should decrease the quantity of a product', () => {
    store.addToCart(mockProduct1);
    store.addToCart(mockProduct1); // Quantity 2, Total 20

    store.decreaseQuantity(mockProduct1.id);

    expect(store.cart()[0].quantity).toBe(1);
    expect(store.cartTotal()).toBe(10);
  });

  it('should remove the product from the cart if quantity reaches 0', () => {
    store.addToCart(mockProduct1);
    store.decreaseQuantity(mockProduct1.id);

    expect(store.cart()).toEqual([]);
    expect(store.cartTotal()).toBe(0);
  });

  it('should correctly calculate the total with different products', () => {
    store.addToCart(mockProduct1); // 10€
    store.addToCart(mockProduct2); // 5€
    store.addToCart(mockProduct2); // 5€

    expect(store.cartTotal()).toBe(20);
    expect(store.cartItemsCount()).toBe(3);
  });

  it('should completely empty the cart with clearCart()', () => {
    store.addToCart(mockProduct1);
    store.addToCart(mockProduct2);

    store.clearCart();

    expect(store.cart()).toEqual([]);
    expect(store.cartTotal()).toBe(0);
    expect(store.cartItemsCount()).toBe(0);
  });
});
