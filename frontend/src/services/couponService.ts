import api from '@/lib/api';
import { ApiResponse, Coupon } from '@/types';

export const couponService = {
  async getActiveCoupons(): Promise<Coupon[]> {
    const res = await api.get<ApiResponse<Coupon[]>>('/coupons');
    return res.data.data;
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ code: string; discount: number; valid: boolean }> {
    const res = await api.post<ApiResponse<{ code: string; discount: number; valid: boolean }>>('/coupons/validate', null, {
      params: { code, subtotal },
    });
    return res.data.data;
  },

  async getAllCouponsAdmin(): Promise<Coupon[]> {
    const res = await api.get<ApiResponse<Coupon[]>>('/admin/coupons');
    return res.data.data;
  },

  async createCoupon(data: any): Promise<Coupon> {
    const res = await api.post<ApiResponse<Coupon>>('/admin/coupons', data);
    return res.data.data;
  },

  async deleteCoupon(id: number): Promise<void> {
    await api.delete(`/admin/coupons/${id}`);
  },
};
