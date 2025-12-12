import { create } from 'zustand';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '../types';
import { ordersApi } from '../services/api';

interface OrderStore {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  fetchOrders: (params?: { date?: string; status?: string }) => Promise<void>;
  createOrder: (order: Partial<Order>) => Promise<Order>;
  updateOrder: (id: string, order: Partial<Order>) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  addItemToCurrentOrder: (item: OrderItem) => void;
  removeItemFromCurrentOrder: (itemId: string) => void;
  updateCurrentOrderItem: (itemId: string, quantity: number) => void;
  clearCurrentOrder: () => void;
  setCurrentOrder: (order: Order | null) => void;
  getOrderByTable: (tableNo: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  fetchOrders: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await ordersApi.getAll(params);
      // Handle both axios response and direct mock response
      const ordersData = response.data?.data || response.data || [];
      set({ orders: ordersData, loading: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch orders';
      set({ error: errorMessage, loading: false });
    }
  },

  createOrder: async (orderData: Partial<Order>) => {
    set({ loading: true, error: null });
    try {
      const response = await ordersApi.create(orderData);
      const newOrder = response.data;
      set(state => ({
        orders: [newOrder, ...state.orders],
        currentOrder: null,
        loading: false
      }));
      return newOrder;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create order', loading: false });
      throw error;
    }
  },

  updateOrder: async (id: string, orderData: Partial<Order>) => {
    set({ loading: true, error: null });
    try {
      const response = await ordersApi.update(id, orderData);
      set(state => ({
        orders: state.orders.map(o => o.id === id ? response.data : o),
        currentOrder: state.currentOrder?.id === id ? response.data : state.currentOrder,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update order', loading: false });
      throw error;
    }
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    set({ loading: true, error: null });
    try {
      await ordersApi.updateStatus(id, status);
      set(state => ({
        orders: state.orders.map(o => 
          o.id === id ? { ...o, status } : o
        ),
        currentOrder: state.currentOrder?.id === id 
          ? { ...state.currentOrder, status }
          : state.currentOrder,
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update order status', loading: false });
      throw error;
    }
  },

  addItemToCurrentOrder: (item: OrderItem) => {
    const currentOrder = get().currentOrder;
    if (!currentOrder) {
      const newOrder: Order = {
        id: 'temp-' + Date.now(),
        order_no: '',
        items: [item],
        status: OrderStatus.PENDING,
        total: item.subtotal,
        payment_status: PaymentStatus.PENDING,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set({ currentOrder: newOrder });
    } else {
      const existingItemIndex = currentOrder.items.findIndex(
        i => i.item_id === item.item_id
      );
      let updatedItems: OrderItem[];
      if (existingItemIndex >= 0) {
        updatedItems = currentOrder.items.map((i, idx) =>
          idx === existingItemIndex
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                subtotal: (i.quantity + item.quantity) * i.price,
              }
            : i
        );
      } else {
        updatedItems = [...currentOrder.items, item];
      }
      const total = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
      set({
        currentOrder: {
          ...currentOrder,
          items: updatedItems,
          total,
        },
      });
    }
  },

  removeItemFromCurrentOrder: (itemId: string) => {
    const currentOrder = get().currentOrder;
    if (currentOrder) {
      const updatedItems = currentOrder.items.filter(i => i.id !== itemId);
      const total = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
      set({
        currentOrder: {
          ...currentOrder,
          items: updatedItems,
          total,
        },
      });
    }
  },

  updateCurrentOrderItem: (itemId: string, quantity: number) => {
    const currentOrder = get().currentOrder;
    if (currentOrder) {
      const updatedItems = currentOrder.items.map(i =>
        i.id === itemId
          ? {
              ...i,
              quantity,
              subtotal: quantity * i.price,
            }
          : i
      );
      const total = updatedItems.reduce((sum, i) => sum + i.subtotal, 0);
      set({
        currentOrder: {
          ...currentOrder,
          items: updatedItems,
          total,
        },
      });
    }
  },

  clearCurrentOrder: () => set({ currentOrder: null }),

  setCurrentOrder: (order: Order | null) => set({ currentOrder: order }),

  getOrderByTable: (tableNo: string) => {
    return get().orders.find(
      o => o.table_no === tableNo && o.status !== OrderStatus.SERVED
    );
  },
}));

