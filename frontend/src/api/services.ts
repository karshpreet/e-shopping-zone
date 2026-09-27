import { apiClient } from './client';

// ── AUTH ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data: { usernameOrEmail: string; password: string }) =>
    apiClient.post('/api/auth/login', data),
  register: (data: { username: string; email: string; password: string; role?: string; fullName?: string }) =>
    apiClient.post('/api/auth/register', data),
  validate: () => apiClient.get('/api/auth/validate'),
};

// ── PROFILE ──────────────────────────────────────────────────────────────────
export const profileApi = {
  getProfile: (userId: number) => apiClient.get(`/api/profile/${userId}`),
  updateProfile: (userId: number, data: object) => apiClient.put(`/api/profile/${userId}`, data),
};

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
export const productApi = {
  getAll: (params?: { page?: number; size?: number; sort?: string }) =>
    apiClient.get('/api/products', { params }),
  getById: (id: number) => apiClient.get(`/api/products/${id}`),
  search: (query: string) => apiClient.get('/api/products/search', { params: { query } }),
  getByCategory: (categoryId: number) => apiClient.get(`/api/products/category/${categoryId}`),
  getByMerchant: (merchantId: number) => apiClient.get(`/api/products/merchant/${merchantId}`),
  create: (data: object) => apiClient.post('/api/products', data),
  update: (id: number, data: object) => apiClient.put(`/api/products/${id}`, data),
  delete: (id: number) => apiClient.delete(`/api/products/${id}`),
};

// ── CATEGORIES ───────────────────────────────────────────────────────────────
export const categoryApi = {
  getAll: () => apiClient.get('/api/categories'),
  getById: (id: number) => apiClient.get(`/api/categories/${id}`),
  create: (data: { name: string; description: string }) => apiClient.post('/api/categories', data),
};

// ── CART ─────────────────────────────────────────────────────────────────────
export const cartApi = {
  getCart: (userId: number) => apiClient.get(`/api/cart/${userId}`),
  addItem: (userId: number, data: { productId: number; quantity: number; productName?: string; unitPrice?: number; imageUrl?: string }) =>
    apiClient.post(`/api/cart/${userId}/items`, data),
  updateItem: (userId: number, productId: number, data: { quantity: number }) =>
    apiClient.put(`/api/cart/${userId}/items/${productId}`, data),
  removeItem: (userId: number, productId: number) =>
    apiClient.delete(`/api/cart/${userId}/items/${productId}`),
  clearCart: (userId: number) => apiClient.delete(`/api/cart/${userId}`),
};

// ── ORDERS ───────────────────────────────────────────────────────────────────
export const orderApi = {
  checkout: (data: {
    customerId: number;
    customerName: string;
    customerEmail: string;
    paymentMethod: 'WALLET' | 'COD';
    shippingAddress: string;
    contactPhone: string;
  }) => apiClient.post('/api/orders/checkout', data),
  getMyOrders: (customerId: number) => apiClient.get(`/api/orders/customer/${customerId}`),
  getOrderById: (orderId: number) => apiClient.get(`/api/orders/${orderId}`),
  getMerchantOrders: () => apiClient.get('/api/orders/merchant'),
  updateStatus: (orderId: number, orderStatus: string) =>
    apiClient.put(`/api/orders/${orderId}/status`, { orderStatus }),
};

// ── WALLET ───────────────────────────────────────────────────────────────────
export const walletApi = {
  getWallet: (userId: number) => apiClient.get(`/api/wallet/${userId}`),
  getBalance: (userId: number) => apiClient.get(`/api/wallet/${userId}/balance`),
  topup: (userId: number, data: { amount: number; description?: string }) =>
    apiClient.post(`/api/wallet/${userId}/topup`, data),
  deduct: (userId: number, data: { amount: number; orderReference?: string; description?: string }) =>
    apiClient.post(`/api/wallet/${userId}/deduct`, data),
  getTransactions: (userId: number) => apiClient.get(`/api/wallet/${userId}/transactions`),
};
