import api from '@/lib/api';
import { ApiResponse, Order, OrderStatus, PageResponse } from '@/types';

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
};
