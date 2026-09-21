import api from '@/lib/api';
import { ApiResponse, FoodItem, Restaurant } from '@/types';

export const favoriteService = {
  async getFavoriteRestaurants(): Promise<Restaurant[]> {
    const res = await api.get<ApiResponse<Restaurant[]>>('/favorites/restaurants');
    return res.data.data;
  },

  async addFavoriteRestaurant(id: number): Promise<void> {
    await api.post(`/favorites/restaurants/${id}`);
  },

  async removeFavoriteRestaurant(id: number): Promise<void> {
    await api.delete(`/favorites/restaurants/${id}`);
  },

  async checkRestaurantFavorite(id: number): Promise<boolean> {
    const res = await api.get<ApiResponse<{ isFavorite: boolean }>>(`/favorites/restaurants/${id}/check`);
    return res.data.data.isFavorite;
  },

  async getFavoriteFoods(): Promise<FoodItem[]> {
    const res = await api.get<ApiResponse<FoodItem[]>>('/favorites/foods');
    return res.data.data;
  },

  async addFavoriteFood(id: number): Promise<void> {
    await api.post(`/favorites/foods/${id}`);
  },

  async removeFavoriteFood(id: number): Promise<void> {
    await api.delete(`/favorites/foods/${id}`);
  },

  async checkFoodFavorite(id: number): Promise<boolean> {
    const res = await api.get<ApiResponse<{ isFavorite: boolean }>>(`/favorites/foods/${id}/check`);
    return res.data.data.isFavorite;
  },
};
