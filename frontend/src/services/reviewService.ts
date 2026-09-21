import api from '@/lib/api';
import { ApiResponse, PageResponse, Review } from '@/types';

export const reviewService = {
  async createReview(data: { orderId: number; foodItemId?: number; rating: number; comment?: string }): Promise<Review> {
    const res = await api.post<ApiResponse<Review>>('/reviews', data);
    return res.data.data;
  },

  async getRestaurantReviews(restaurantId: number, params?: { page?: number; size?: number }): Promise<PageResponse<Review>> {
    const res = await api.get<ApiResponse<PageResponse<Review>>>(`/restaurants/${restaurantId}/reviews`, { params });
    return res.data.data;
  },

  async getFoodReviews(foodItemId: number, params?: { page?: number; size?: number }): Promise<PageResponse<Review>> {
    const res = await api.get<ApiResponse<PageResponse<Review>>>(`/foods/${foodItemId}/reviews`, { params });
    return res.data.data;
  },
};
