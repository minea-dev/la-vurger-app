import { OrderType } from '../enums/order-type.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { ProductDTO } from './product.dto';

export interface OrderItemDTO {
  id?: number;
  productId: number;
  product?: ProductDTO;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  notes?: string;
}

export interface OrderDTO {
  id: number;
  orderType: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  transactionId?: string;
  customerEmail?: string;
  customerComment?: string;
  createdAt: string;
  updatedAt: string;

  items: OrderItemDTO[];
  tableId?: number | null;
}
