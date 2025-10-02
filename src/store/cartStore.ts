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
};

type CartComputed = {
  itemCount: number;
  subtotal: number;
};

type CartActions = {
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
};

export type CartStore = CartState & CartComputed & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      get itemCount() {
        return get().items.reduce((acc, item) => acc + item.quantity, 0);
      },
      get subtotal() {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
      addItem: (item, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            const updated = state.items.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    quantity: Math.min(i.quantity + qty, item.stock ?? i.stock),
                  }
                : i,
            );
            return { items: updated };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(qty, item.stock) }],
          };
        });
      },
      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.id !== id) return item;
              const safeQty = Math.max(0, Math.min(quantity, item.stock));
              return { ...item, quantity: safeQty };
            })
            .filter((item) => item.quantity > 0),
        }));
      },
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "planthub-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);


