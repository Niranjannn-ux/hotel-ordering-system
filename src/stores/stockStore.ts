import { create } from 'zustand';
import { StockEntry } from '../types';
import { stockApi } from '../services/api';

interface StockStore {
  stockEntries: StockEntry[];
  selectedDate: string;
  loading: boolean;
  error: string | null;
  fetchStockByDate: (date: string) => Promise<void>;
  createStockEntry: (entry: Partial<StockEntry>) => Promise<void>;
  updateStockEntry: (id: string, entry: Partial<StockEntry>) => Promise<void>;
  setSelectedDate: (date: string) => void;
  getStockByItemId: (itemId: string) => StockEntry | undefined;
}

export const useStockStore = create<StockStore>((set, get) => ({
  stockEntries: [],
  selectedDate: new Date().toISOString().split('T')[0],
  loading: false,
  error: null,

  fetchStockByDate: async (date: string) => {
    set({ loading: true, error: null, selectedDate: date });
    try {
      const response = await stockApi.getByDate(date);
      set({ stockEntries: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch stock entries', loading: false });
    }
  },

  createStockEntry: async (entry: Partial<StockEntry>) => {
    set({ loading: true, error: null });
    try {
      const response = await stockApi.createEntry(entry);
      set(state => ({
        stockEntries: [...state.stockEntries, response.data],
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to create stock entry', loading: false });
      throw error;
    }
  },

  updateStockEntry: async (id: string, entry: Partial<StockEntry>) => {
    set({ loading: true, error: null });
    try {
      const response = await stockApi.updateEntry(id, entry);
      set(state => ({
        stockEntries: state.stockEntries.map(e => 
          e.id === id ? response.data : e
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update stock entry', loading: false });
      throw error;
    }
  },

  setSelectedDate: (date: string) => set({ selectedDate: date }),

  getStockByItemId: (itemId: string) => {
    return get().stockEntries.find(e => e.item_id === itemId);
  },
}));


