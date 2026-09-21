import api from '@/lib/api';
import { ApiResponse, FoodItem, PageResponse } from '@/types';

export const foodService = {
  async searchFoods(params?: {
    search?: string;
    restaurantId?: number;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    availableOnly?: boolean;
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<FoodItem>> {
    const res = await api.get<ApiResponse<PageResponse<FoodItem>>>('/foods', { params });
    return res.data.data;
  },

  async getPopularFoods(): Promise<FoodItem[]> {
    const res = await api.get<ApiResponse<FoodItem[]>>('/foods/popular');
    return res.data.data;
  },

  async getFoodById(id: number): Promise<FoodItem> {
    const res = await api.get<ApiResponse<FoodItem>>(`/foods/${id}`);
    return res.data.data;
  },

  async getFoodsByRestaurant(restaurantId: number): Promise<FoodItem[]> {
    const res = await api.get<ApiResponse<FoodItem[]>>(`/restaurants/${restaurantId}/foods`);
    return res.data.data;
  },

  // Owner methods
  async getOwnerFoods(params?: { page?: number; size?: number }): Promise<PageResponse<FoodItem>> {
    const res = await api.get<ApiResponse<PageResponse<FoodItem>>>('/restaurant/foods', { params });
    return res.data.data;
  },

  async createFoodItem(data: any): Promise<FoodItem> {
    const res = await api.post<ApiResponse<FoodItem>>('/restaurant/foods', data);
    return res.data.data;
  },

  async updateFoodItem(id: number, data: any): Promise<FoodItem> {
    const res = await api.put<ApiResponse<FoodItem>>(`/restaurant/foods/${id}`, data);
    return res.data.data;
  },

  async toggleAvailability(id: number): Promise<FoodItem> {
    const res = await api.patch<ApiResponse<FoodItem>>(`/restaurant/foods/${id}/toggle-availability`);
    return res.data.data;
  },

  async deleteFoodItem(id: number): Promise<void> {
    await api.delete(`/restaurant/foods/${id}`);
  },
};
