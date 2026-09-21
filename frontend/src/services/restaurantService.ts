import api from '@/lib/api';
import { ApiResponse, PageResponse, Restaurant, RestaurantCategory, MenuCategory, RestaurantDashboardStats } from '@/types';

export const restaurantService = {
  async getRestaurants(params?: { search?: string; categoryId?: number; page?: number; size?: number; sort?: string }): Promise<PageResponse<Restaurant>> {
    const res = await api.get<ApiResponse<PageResponse<Restaurant>>>('/restaurants', { params });
    return res.data.data;
  },

  async getRestaurantById(id: number): Promise<Restaurant> {
    const res = await api.get<ApiResponse<Restaurant>>(`/restaurants/${id}`);
    return res.data.data;
  },

  async getCategories(): Promise<RestaurantCategory[]> {
    const res = await api.get<ApiResponse<RestaurantCategory[]>>('/restaurant-categories');
    return res.data.data;
  },

  async getMenuCategories(restaurantId: number): Promise<MenuCategory[]> {
    const res = await api.get<ApiResponse<MenuCategory[]>>(`/restaurants/${restaurantId}/menu-categories`);
    return res.data.data;
  },

  // Owner methods
  async getMyRestaurant(): Promise<Restaurant> {
    const res = await api.get<ApiResponse<Restaurant>>('/restaurant/me');
    return res.data.data;
  },

  async createRestaurant(data: any): Promise<Restaurant> {
    const res = await api.post<ApiResponse<Restaurant>>('/restaurant', data);
    return res.data.data;
  },

  async updateRestaurant(data: any): Promise<Restaurant> {
    const res = await api.put<ApiResponse<Restaurant>>('/restaurant/me', data);
    return res.data.data;
  },

  async getRestaurantDashboard(): Promise<RestaurantDashboardStats> {
    const res = await api.get<ApiResponse<RestaurantDashboardStats>>('/restaurant/dashboard');
    return res.data.data;
  },

  async getOwnerMenuCategories(): Promise<MenuCategory[]> {
    const res = await api.get<ApiResponse<MenuCategory[]>>('/restaurant/menu-categories');
    return res.data.data;
  },

  async createMenuCategory(data: { name: string; description?: string; displayOrder?: number; active?: boolean }): Promise<MenuCategory> {
    const res = await api.post<ApiResponse<MenuCategory>>('/restaurant/menu-categories', data);
    return res.data.data;
  },

  async updateMenuCategory(id: number, data: any): Promise<MenuCategory> {
    const res = await api.put<ApiResponse<MenuCategory>>(`/restaurant/menu-categories/${id}`, data);
    return res.data.data;
  },

  async deleteMenuCategory(id: number): Promise<void> {
    await api.delete(`/restaurant/menu-categories/${id}`);
  },
};
