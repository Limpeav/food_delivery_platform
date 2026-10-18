import api from '@/lib/api';
import { ApiResponse, KhqrResponse, KhqrVerificationResponse } from '@/types';
import { PaymentInfo } from './orderService';

export const paymentService = {
  /**
   * Generate or retrieve Bakong KHQR for online payment of an order.
   */
  async getKhqr(orderId: number): Promise<KhqrResponse> {
    const res = await api.get<ApiResponse<KhqrResponse>>(`/payments/${orderId}/khqr`);
    return res.data.data;
  },

  /**
   * Verify Bakong KHQR payment via Open API check_transaction_by_md5.
   * If simulate=true, performs local test payment verification.
   */
  async verifyKhqr(orderId: number, simulate = false): Promise<KhqrVerificationResponse> {
    const res = await api.post<ApiResponse<KhqrVerificationResponse>>(
      `/payments/${orderId}/khqr/verify?simulate=${simulate}`
    );
    return res.data.data;
  },

  /**
   * Fetch payment transaction details for a specific order.
   */
  async getPaymentByOrder(orderId: number): Promise<PaymentInfo> {
    const res = await api.get<ApiResponse<PaymentInfo>>(`/orders/${orderId}/payment`);
    return res.data.data;
  },

  /**
   * Retrieve current user's full payment history.
   */
  async getMyPaymentHistory(): Promise<PaymentInfo[]> {
    const res = await api.get<ApiResponse<PaymentInfo[]>>('/payments/history');
    return res.data.data;
  },

  /**
   * Admin-only: Retrieve all platform payments.
   */
  async getAllPaymentsAdmin(): Promise<PaymentInfo[]> {
    const res = await api.get<ApiResponse<PaymentInfo[]>>('/admin/payments');
    return res.data.data;
  },
};
