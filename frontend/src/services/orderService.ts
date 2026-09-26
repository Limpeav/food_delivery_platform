import api from '@/lib/api';
import { ApiResponse, Order, OrderStatus, PageResponse } from '@/types';

export interface DeliveryEta {
  etaMinutes: number;
  distanceKm?: number;
  message: string;
}

export interface PaymentInfo {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionReference: string;
  createdAt: string;
}

export interface KhqrResponse {
  orderId: number;
  qrCode: string;
  qrImage: string;
  md5: string;
  amount: number;
  currency: string;
  merchantName: string;
  merchantAccountId: string;
  paymentStatus: string;
  simulated: boolean;
}

export interface KhqrVerificationResponse {
  orderId: number;
  verified: boolean;
  paymentStatus: string;
  transactionHash?: string;
  md5?: string;
  amount: number;
  currency: string;
  message: string;
  verifiedAt?: string;
}

export const orderService = {
  async createOrder(data: {
    addressId: number;
    couponCode?: string;
    paymentMethod: string;
    notes?: string;
  }): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>('/orders', data);
    return res.data.data;
  },

  async getMyOrders(params?: { page?: number; size?: number }): Promise<PageResponse<Order>> {
    const res = await api.get<ApiResponse<PageResponse<Order>>>('/orders', { params });
    return res.data.data;
  },

  async getOrderById(id: number): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },

  async cancelOrder(id: number): Promise<Order> {
    const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
    return res.data.data;
  },

  /** Re-fills the cart with items from a previous order and returns original order info */
  async reorder(orderId: number): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>(`/orders/${orderId}/reorder`);
    return res.data.data;
  },

  /** Get estimated delivery time for an active order */
  async getDeliveryEta(orderId: number): Promise<DeliveryEta> {
    const res = await api.get<ApiResponse<DeliveryEta>>(`/orders/${orderId}/eta`);
    return res.data.data;
  },

  /** Get payment details for a specific order */
  async getPaymentByOrder(orderId: number): Promise<PaymentInfo> {
    const res = await api.get<ApiResponse<PaymentInfo>>(`/orders/${orderId}/payment`);
    return res.data.data;
  },

  /** Get current user's payment history */
  async getMyPaymentHistory(): Promise<PaymentInfo[]> {
    const res = await api.get<ApiResponse<PaymentInfo[]>>('/payments/history');
    return res.data.data;
  },

  // Restaurant Owner methods
  async getRestaurantOrders(params?: { status?: OrderStatus; page?: number; size?: number }): Promise<PageResponse<Order>> {
    const res = await api.get<ApiResponse<PageResponse<Order>>>('/restaurant/orders', { params });
    return res.data.data;
  },

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const res = await api.patch<ApiResponse<Order>>(`/restaurant/orders/${orderId}/status`, { status });
    return res.data.data;
  },

  // Admin methods
  async getAllOrdersAdmin(params?: { page?: number; size?: number }): Promise<PageResponse<Order>> {
    const res = await api.get<ApiResponse<PageResponse<Order>>>('/admin/orders', { params });
    return res.data.data;
  },

  /** Admin revenue time-series analytics */
  async getRevenueTimeSeries(params?: {
    from?: string;
    to?: string;
    granularity?: 'daily' | 'weekly' | 'monthly';
  }): Promise<{ labels: string[]; revenue: number[]; orderCounts: number[]; granularity: string }> {
    const res = await api.get<ApiResponse<any>>('/admin/analytics/revenue', { params });
    return res.data.data;
  },

  /** Generate or retrieve Bakong KHQR for online payment */
  async getBakongKhqr(orderId: number): Promise<KhqrResponse> {
    const res = await api.get<ApiResponse<KhqrResponse>>(`/payments/${orderId}/khqr`);
    return res.data.data;
  },

  /** Verify Bakong KHQR payment via Open API */
  async verifyBakongKhqr(orderId: number, simulate = false): Promise<KhqrVerificationResponse> {
    const res = await api.post<ApiResponse<KhqrVerificationResponse>>(
      `/payments/${orderId}/khqr/verify?simulate=${simulate}`
    );
    return res.data.data;
  },
};

