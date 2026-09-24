import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  collection: string;
  variant: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  isOpen: boolean;
  items: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string, variant: string) => void;
  updateQuantity: (id: string, variant: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  isOpen: false,
  items: [],
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(
      (item) => item.id === newItem.id && item.variant === newItem.variant
    );
    if (existingItem) {
      return {
        items: state.items.map((item) =>
          item.id === newItem.id && item.variant === newItem.variant
            ? { ...item, quantity: item.quantity + (newItem.quantity || 1) }
            : item
        ),
        isOpen: true,
      };
    }
    return {
      items: [...state.items, { ...newItem, quantity: newItem.quantity || 1 }],
      isOpen: true,
    };
  }),
  removeItem: (id, variant) => set((state) => ({
    items: state.items.filter((item) => !(item.id === id && item.variant === variant)),
  })),
  updateQuantity: (id, variant, quantity) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id && item.variant === variant
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    ),
  })),
  clearCart: () => set({ items: [] }),
}));
