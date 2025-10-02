import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  image?: string;
  sellerId?: string;
};

type CartState = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

type CartActions = {
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

export type CartStore = CartState & CartActions;

const calculateItemCount = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.quantity, 0);
};

const calculateSubtotal = (items: CartItem[]) => {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      itemCount: 0,
      subtotal: 0,
      addItem: (item, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          let newItems: CartItem[];
          
          if (existing) {
            newItems = state.items.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    quantity: Math.min(i.quantity + qty, item.stock ?? i.stock),
                  }
                : i,
            );
          } else {
            newItems = [...state.items, { ...item, quantity: Math.min(qty, item.stock) }];
          }
          
          return {
            items: newItems,
            itemCount: calculateItemCount(newItems),
            subtotal: calculateSubtotal(newItems),
          };
        });
      },
      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          return {
            items: newItems,
            itemCount: calculateItemCount(newItems),
            subtotal: calculateSubtotal(newItems),
          };
        });
      },
      updateQuantity: (id, quantity) => {
        set((state) => {
          const newItems = state.items
            .map((item) => {
              if (item.id !== id) return item;
              const safeQty = Math.max(0, Math.min(quantity, item.stock));
              return { ...item, quantity: safeQty };
            })
            .filter((item) => item.quantity > 0);
          
          return {
            items: newItems,
            itemCount: calculateItemCount(newItems),
            subtotal: calculateSubtotal(newItems),
          };
        });
      },
      clearCart: () => set({ items: [], itemCount: 0, subtotal: 0 }),
    }),
    {
      name: "planthub-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.itemCount = calculateItemCount(state.items);
          state.subtotal = calculateSubtotal(state.items);
        }
      },
    },
  ),
);


