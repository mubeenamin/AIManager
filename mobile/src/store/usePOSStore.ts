import { create } from 'zustand';
import { Product, CartItem, Customer, PaymentMethod, HoldSale } from '../types';

interface POSState {
  cart: CartItem[];
  selectedCustomer: Customer | null;
  discountPercentage: number;
  taxRate: number; // e.g. 5 for 5%
  notes: string;
  heldSales: HoldSale[];
  searchQuery: string;
  selectedCategory: string; // 'ALL' or categoryId

  // POS Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemDiscount: (productId: string, discountPct: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setCartDiscount: (percentage: number) => void;
  setTaxRate: (rate: number) => void;
  setNotes: (notes: string) => void;
  clearCart: () => void;

  // Hold / Resume
  holdCurrentSale: () => void;
  resumeSale: (holdId: string) => void;
  cancelHeldSale: (holdId: string) => void;

  // Search & Filter
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (categoryId: string) => void;

  // Calculations
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTaxAmount: () => number;
  getTotalAmount: () => number;
}

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  selectedCustomer: null,
  discountPercentage: 0,
  taxRate: 5, // Default 5% tax
  notes: '',
  heldSales: [],
  searchQuery: '',
  selectedCategory: 'ALL',

  addToCart: (product: Product, qtyToAdd = 1) => {
    const { cart } = get();
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      const currentItem = updatedCart[existingIndex];
      const newQty = currentItem.quantity + qtyToAdd;
      const unitPrice = currentItem.unitPrice;
      const discountPct = currentItem.discountPercentage;
      const effectivePrice = unitPrice * (1 - discountPct / 100);

      updatedCart[existingIndex] = {
        ...currentItem,
        quantity: newQty,
        itemTotal: effectivePrice * newQty,
      };
      set({ cart: updatedCart });
    } else {
      const unitPrice = product.sellingPrice;
      const newItem: CartItem = {
        product,
        quantity: qtyToAdd,
        unitPrice,
        costPrice: product.costPrice,
        discountPercentage: 0,
        taxRate: product.taxRate || 5,
        itemTotal: unitPrice * qtyToAdd,
      };
      set({ cart: [...cart, newItem] });
    }
  },

  removeFromCart: (productId: string) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeFromCart(productId);
      return;
    }
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.product.id === productId) {
          const effectivePrice = item.unitPrice * (1 - item.discountPercentage / 100);
          return {
            ...item,
            quantity,
            itemTotal: effectivePrice * quantity,
          };
        }
        return item;
      }),
    }));
  },

  updateItemDiscount: (productId: string, discountPct: number) => {
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.product.id === productId) {
          const effectivePrice = item.unitPrice * (1 - discountPct / 100);
          return {
            ...item,
            discountPercentage: discountPct,
            itemTotal: effectivePrice * item.quantity,
          };
        }
        return item;
      }),
    }));
  },

  setCustomer: (customer: Customer | null) => set({ selectedCustomer: customer }),
  setCartDiscount: (percentage: number) => set({ discountPercentage: percentage }),
  setTaxRate: (rate: number) => set({ taxRate: rate }),
  setNotes: (notes: string) => set({ notes }),

  clearCart: () =>
    set({
      cart: [],
      selectedCustomer: null,
      discountPercentage: 0,
      notes: '',
    }),

  holdCurrentSale: () => {
    const { cart, selectedCustomer, notes, heldSales } = get();
    if (cart.length === 0) return;

    const newHold: HoldSale = {
      id: 'hold-' + Date.now(),
      holdCode: 'HOLD-' + Math.floor(1000 + Math.random() * 9000),
      heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: [...cart],
      customer: selectedCustomer || undefined,
      notes,
    };

    set({
      heldSales: [newHold, ...heldSales],
      cart: [],
      selectedCustomer: null,
      discountPercentage: 0,
      notes: '',
    });
  },

  resumeSale: (holdId: string) => {
    const { heldSales } = get();
    const target = heldSales.find((h) => h.id === holdId);
    if (!target) return;

    set({
      cart: target.items,
      selectedCustomer: target.customer || null,
      notes: target.notes || '',
      heldSales: heldSales.filter((h) => h.id !== holdId),
    });
  },

  cancelHeldSale: (holdId: string) => {
    set((state) => ({
      heldSales: state.heldSales.filter((h) => h.id !== holdId),
    }));
  },

  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedCategory: (categoryId: string) => set({ selectedCategory: categoryId }),

  getSubtotal: () => {
    return get().cart.reduce((sum, item) => sum + item.itemTotal, 0);
  },

  getDiscountAmount: () => {
    const subtotal = get().getSubtotal();
    return (subtotal * get().discountPercentage) / 100;
  },

  getTaxAmount: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const taxableAmount = Math.max(0, subtotal - discount);
    return (taxableAmount * get().taxRate) / 100;
  },

  getTotalAmount: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const tax = get().getTaxAmount();
    return Math.max(0, subtotal - discount + tax);
  },
}));
