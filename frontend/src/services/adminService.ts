import api from '@/lib/api';
import {
  AdminDashboardStats,
  ApiResponse,
  Driver,
  PageResponse,
  Restaurant,
  RestaurantCategory,
  RestaurantStatus,
  Review,
  Role,
  User,
  UserStatus,
} from '@/types';

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const res = await api.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard');
    return res.data.data;
  },

  async getUsers(params?: { role?: Role; page?: number; size?: number }): Promise<PageResponse<User>> {
    const res = await api.get<ApiResponse<PageResponse<User>>>('/admin/users', { params });
    return res.data.data;
  },

  async updateUserStatus(id: number, status: UserStatus): Promise<User> {
    const res = await api.patch<ApiResponse<User>>(`/admin/users/${id}/status`, null, {
      params: { status },
    });
    return res.data.data;
  },

  async getRestaurants(params?: { status?: RestaurantStatus; page?: number; size?: number }): Promise<PageResponse<Restaurant>> {
    const res = await api.get<ApiResponse<PageResponse<Restaurant>>>('/admin/restaurants', { params });
    return res.data.data;
  },

  async updateRestaurantStatus(id: number, status: RestaurantStatus): Promise<Restaurant> {
    const res = await api.patch<ApiResponse<Restaurant>>(`/admin/restaurants/${id}/status`, { status });
    return res.data.data;
  },

  async getDrivers(params?: { approved?: boolean; page?: number; size?: number }): Promise<PageResponse<Driver>> {
    const res = await api.get<ApiResponse<PageResponse<Driver>>>('/admin/drivers', { params });
    return res.data.data;
  },

  async approveDriver(id: number, approve: boolean): Promise<Driver> {
    const res = await api.patch<ApiResponse<Driver>>(`/admin/drivers/${id}/approve`, null, {
      params: { approve },
    });
    return res.data.data;
  },

  async createCategory(data: any): Promise<RestaurantCategory> {
    const res = await api.post<ApiResponse<RestaurantCategory>>('/restaurant-categories', data);
    return res.data.data;
  },

  async updateCategory(id: number, data: any): Promise<RestaurantCategory> {
    const res = await api.put<ApiResponse<RestaurantCategory>>(`/restaurant-categories/${id}`, data);
    return res.data.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(`/restaurant-categories/${id}`);
  },

  async getReviews(params?: { page?: number; size?: number }): Promise<PageResponse<Review>> {
    const res = await api.get<ApiResponse<PageResponse<Review>>>('/admin/reviews', { params });
    return res.data.data;
  },

  async deleteReview(id: number): Promise<void> {
    await api.delete(`/admin/reviews/${id}`);
  },
};

