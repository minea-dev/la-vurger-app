import { OrderType } from '../enums/order-type.enum';
import { OrderStatus } from '../enums/order-status.enum';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { ProductDTO } from './product.dto';

// ==========================================
// Creation DTOs (Front -> Back Contract)
// ==========================================

export interface OrderItemRequest {
  productId: number;
  quantity: number;
  notes?: string;
}

export interface OrderRequest {
  tableId?: number | null;
  orderType: string;
  paymentMethod: string;
  customerComment?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  items: OrderItemRequest[];
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

// ==========================================
// Full DTOs (For Kitchen/Admin views)
// ==========================================

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
  orderNumber: string;
  orderType: OrderType;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  transactionId?: string;
  customerComment?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
  tableId?: number | null;
  estimatedTime?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}
