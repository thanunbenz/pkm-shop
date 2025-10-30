import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  discountprice: number;
  issale: boolean;
  image: string | null;
  quantity: number;
  availableStock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  syncWithServer: (userId: number) => Promise<void>;
  loadFromServer: (userId: number) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existingItem = get().items.find(i => i.productId === item.productId);

        if (existingItem) {
          // Update quantity if item already exists
          const newQuantity = existingItem.quantity + (item.quantity || 1);
          const maxQuantity = Math.min(newQuantity, item.availableStock);

          set({
            items: get().items.map(i =>
              i.productId === item.productId
                ? { ...i, quantity: maxQuantity }
                : i
            ),
          });
        } else {
          // Add new item
          set({
            items: [...get().items, { ...item, quantity: item.quantity || 1 }],
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map(item =>
            item.productId === productId
              ? { ...item, quantity: Math.min(quantity, item.availableStock) }
              : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.issale ? item.discountprice : item.price;
          return total + price * item.quantity;
        }, 0);
      },

      // Sync local cart to server when user logs in
      syncWithServer: async (userId: number) => {
        const localItems = get().items;

        if (localItems.length === 0) return;

        try {
          // Send local cart to server
          await fetch('/api/v1/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, items: localItems }),
          });

          // Load updated cart from server
          await get().loadFromServer(userId);
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      },

      // Load cart from server for logged-in users
      loadFromServer: async (userId: number) => {
        try {
          const response = await fetch(`/api/v1/cart/${userId}`);
          if (!response.ok) throw new Error('Failed to load cart');

          const data = await response.json();
          set({ items: data.items || [] });
        } catch (error) {
          console.error('Failed to load cart from server:', error);
        }
      },
    }),
    {
      name: 'cart-storage', // localStorage key
      // Only persist for non-logged-in users
      partialize: (state) => ({ items: state.items }),
    }
  )
);
