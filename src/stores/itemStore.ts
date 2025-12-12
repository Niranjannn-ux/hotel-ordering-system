import { create } from 'zustand';
import { Item } from '../types';
import { itemsApi } from '../services/api';

interface ItemStore {
  items: Item[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  getItemByNo: (itemNo: number) => Item | undefined;
  addItem: (item: Partial<Item>) => Promise<void>;
  updateItem: (id: string, item: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setItems: (items: Item[]) => void;
}

export const useItemStore = create<ItemStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const response = await itemsApi.getAll();
      // Handle both axios response and direct mock response
      const itemsData = response.data?.data || response.data || [];
      set({ items: itemsData, loading: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to fetch items';
      set({ error: errorMessage, loading: false });
    }
  },

  getItemByNo: (itemNo: number) => {
    return get().items.find(item => item.item_no === itemNo);
  },

  addItem: async (item: Partial<Item>) => {
    set({ loading: true, error: null });
    try {
      const response = await itemsApi.create(item);
      // Handle both axios response and direct mock response
      const newItem = response.data?.data || response.data;
      if (newItem) {
        set(state => ({ 
          items: [...state.items, newItem], 
          loading: false 
        }));
      } else {
        // If response doesn't include the item, fetch all items again
        const fetchResponse = await itemsApi.getAll();
        const itemsData = fetchResponse.data?.data || fetchResponse.data || [];
        set({ items: itemsData, loading: false });
      }
    } catch (error: any) {
      let errorMessage = 'Failed to add item';
      
      if (error.networkError || error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
        errorMessage = `Network Error: Cannot connect to backend API. Please ensure the server is running at ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateItem: async (id: string, item: Partial<Item>) => {
    set({ loading: true, error: null });
    try {
      const response = await itemsApi.update(id, item);
      set(state => ({
        items: state.items.map(i => i.id === id ? response.data : i),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update item', loading: false });
      throw error;
    }
  },

  deleteItem: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await itemsApi.delete(id);
      set(state => ({
        items: state.items.filter(i => i.id !== id),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete item', loading: false });
      throw error;
    }
  },

  setItems: (items: Item[]) => set({ items }),
}));

