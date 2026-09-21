import { create } from 'zustand';
import { cartService } from '@/services/cartService';
import { Cart } from '@/types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isDrawerOpen: boolean;
  fetchCart: () => Promise<void>;
  addItem: (foodItemId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  isDrawerOpen: false,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const cart = await cartService.getCart();
      set({ cart, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (foodItemId, quantity = 1) => {
    set({ isLoading: true });
    try {
      const updated = await cartService.addToCart(foodItemId, quantity);
      set({ cart: updated, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateItem: async (itemId, quantity) => {
    set({ isLoading: true });
    try {
      const updated = await cartService.updateCartItem(itemId, quantity);
      set({ cart: updated, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true });
    try {
      const updated = await cartService.removeCartItem(itemId);
      set({ cart: updated, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      const updated = await cartService.clearCart();
      set({ cart: updated, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },
}));
