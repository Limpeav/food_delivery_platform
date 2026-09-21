import api from '@/lib/api';
import { ApiResponse, Delivery, Driver, DriverDashboardStats, PageResponse } from '@/types';

export const deliveryService = {
  async getDriverDashboard(): Promise<DriverDashboardStats> {
    const res = await api.get<ApiResponse<DriverDashboardStats>>('/driver/dashboard');
    return res.data.data;
  },

  async getMyDeliveries(params?: { page?: number; size?: number }): Promise<PageResponse<Delivery>> {
    const res = await api.get<ApiResponse<PageResponse<Delivery>>>('/driver/deliveries', { params });
    return res.data.data;
  },

  async getMyDriverProfile(): Promise<Driver> {
    const res = await api.get<ApiResponse<Driver>>('/driver/me');
    return res.data.data;
  },

  async registerDriver(data: { vehicleType: string; vehicleNumber: string; licenseNumber: string }): Promise<Driver> {
    const res = await api.post<ApiResponse<Driver>>('/driver/register', data);
    return res.data.data;
  },

  async toggleOnline(): Promise<Driver> {
    const res = await api.patch<ApiResponse<Driver>>('/driver/toggle-online');
    return res.data.data;
  },

  async updateLocation(latitude: number, longitude: number): Promise<Driver> {
    const res = await api.post<ApiResponse<Driver>>('/driver/location', { latitude, longitude });
    return res.data.data;
  },

  async getAvailableDeliveries(): Promise<Delivery[]> {
    const res = await api.get<ApiResponse<Delivery[]>>('/driver/deliveries/available');
    return res.data.data;
  },

  async getActiveDelivery(): Promise<Delivery | null> {
    const res = await api.get<ApiResponse<Delivery | null>>('/driver/deliveries/active');
    return res.data.data;
  },

  async acceptDelivery(id: number): Promise<Delivery> {
    const res = await api.post<ApiResponse<Delivery>>(`/driver/deliveries/${id}/accept`);
    return res.data.data;
  },

  async pickupFood(id: number): Promise<Delivery> {
    const res = await api.post<ApiResponse<Delivery>>(`/driver/deliveries/${id}/pickup`);
    return res.data.data;
  },

  async startDelivering(id: number): Promise<Delivery> {
    const res = await api.post<ApiResponse<Delivery>>(`/driver/deliveries/${id}/start-delivering`);
    return res.data.data;
  },

  async completeDelivery(id: number): Promise<Delivery> {
    const res = await api.post<ApiResponse<Delivery>>(`/driver/deliveries/${id}/complete`);
    return res.data.data;
  },
};
