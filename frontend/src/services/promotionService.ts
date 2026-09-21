import api from '@/lib/api';
import { ApiResponse, Promotion } from '@/types';

export const promotionService = {
  async getActivePromotions(): Promise<Promotion[]> {
    const res = await api.get<ApiResponse<Promotion[]>>('/promotions');
    return res.data.data;
  },

  async getPromotionsByRestaurant(restaurantId: number): Promise<Promotion[]> {
    const res = await api.get<ApiResponse<Promotion[]>>(`/restaurants/${restaurantId}/promotions`);
    return res.data.data;
  },

  async getMyPromotions(): Promise<Promotion[]> {
    const res = await api.get<ApiResponse<Promotion[]>>('/restaurant/promotions');
    return res.data.data;
  },

  async createPromotion(data: any): Promise<Promotion> {
    const res = await api.post<ApiResponse<Promotion>>('/restaurant/promotions', data);
    return res.data.data;
  },

  async deletePromotion(id: number): Promise<void> {
    await api.delete(`/restaurant/promotions/${id}`);
  },
};
