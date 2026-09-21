import api from '@/lib/api';
import { Address, ApiResponse } from '@/types';

export const addressService = {
  async getAddresses(): Promise<Address[]> {
    const res = await api.get<ApiResponse<Address[]>>('/addresses');
    return res.data.data;
  },

  async getAddressById(id: number): Promise<Address> {
    const res = await api.get<ApiResponse<Address>>(`/addresses/${id}`);
    return res.data.data;
  },

  async createAddress(data: {
    label: string;
    recipientName: string;
    phoneNumber: string;
    addressLine: string;
    city: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  }): Promise<Address> {
    const res = await api.post<ApiResponse<Address>>('/addresses', data);
    return res.data.data;
  },

  async updateAddress(id: number, data: any): Promise<Address> {
    const res = await api.put<ApiResponse<Address>>(`/addresses/${id}`, data);
    return res.data.data;
  },

  async deleteAddress(id: number): Promise<void> {
    await api.delete(`/addresses/${id}`);
  },

  async setDefault(id: number): Promise<Address> {
    const res = await api.patch<ApiResponse<Address>>(`/addresses/${id}/default`);
    return res.data.data;
  },
};
