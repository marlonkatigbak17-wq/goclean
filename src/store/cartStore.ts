'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, withInstallation?: boolean) => void;
  removeItem: (productId: string, withInstallation: boolean) => void;
  updateQuantity: (productId: string, withInstallation: boolean, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, withInstallation = false) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.withInstallation === withInstallation
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.withInstallation === withInstallation
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1, withInstallation }] };
        });
      },

      removeItem: (productId, withInstallation) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.withInstallation === withInstallation)
          ),
        }));
      },

      updateQuantity: (productId, withInstallation, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId, withInstallation);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId && i.withInstallation === withInstallation
              ? { ...i, quantity }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      total: () =>
        get().items.reduce((sum, item) => {
          const price = item.withInstallation && item.product.priceWithInstallation
            ? item.product.priceWithInstallation
            : item.product.price;
          return sum + price * item.quantity;
        }, 0),

      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'goclean-cart' }
  )
);
