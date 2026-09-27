export type UserRole = 'CUSTOMER' | 'MERCHANT';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  token?: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  avatarUrl?: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  iconName?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  categoryId: number;
  categoryName?: string;
  imageUrl: string;
  merchantId: number;
  active: boolean;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
  subtotal: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

export type PaymentMethod = 'WALLET' | 'COD';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED';
export type OrderStatus = 'PLACED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: string;
  contactPhone: string;
  walletTransactionId?: string;
  items: OrderItem[];
  createdAt: string;
}

export interface Wallet {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  status: string;
}

export interface WalletTransaction {
  id: number;
  transactionId: string;
  walletId: number;
  userId: number;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  referenceId: string;
  description: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  email: string;
  role: UserRole;
}
