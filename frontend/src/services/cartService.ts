import api from '@/lib/api';
import { ApiResponse, Cart } from '@/types';

export const cartService = {
  async getCart(): Promise<Cart> {
    const res = await api.get<ApiResponse<Cart>>('/cart');
    return res.data.data;
  },

  async addToCart(foodItemId: number, quantity: number = 1): Promise<Cart> {
    const res = await api.post<ApiResponse<Cart>>('/cart/items', { foodItemId, quantity });
    return res.data.data;
  },

  async updateCartItem(itemId: number, quantity: number): Promise<Cart> {
    const res = await api.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
    return res.data.data;
  },

  async removeCartItem(itemId: number): Promise<Cart> {
    const res = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    return res.data.data;
  },

  async clearCart(): Promise<Cart> {
    const res = await api.delete<ApiResponse<Cart>>('/cart');
    return res.data.data;
  },
};
