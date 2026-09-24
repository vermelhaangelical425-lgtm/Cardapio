import { create } from 'zustand'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, delta: number) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.id === item.id)
    if (existing) {
      return { items: state.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) }
    }
    return { items: [...state.items, item] }
  }),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
  updateQuantity: (id, delta) => set((state) => ({
    items: state.items.map(i => {
      if (i.id === id) {
        const newQ = Math.max(0, i.quantity + delta)
        return { ...i, quantity: newQ }
      }
      return i
    }).filter(i => i.quantity > 0)
  })),
  clearCart: () => set({ items: [] }),
  total: () => get().items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
}))
