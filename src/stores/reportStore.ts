import { create } from 'zustand';
import { DailySalesReport, DailyStockReport, StockSuggestion } from '../types';
import { reportsApi } from '../services/api';

interface ReportStore {
  salesReport: DailySalesReport | null;
  stockReport: DailyStockReport | null;
  stockSuggestions: StockSuggestion[];
  selectedDate: string;
  loading: boolean;
  error: string | null;
  fetchSalesReport: (date: string) => Promise<void>;
  fetchStockReport: (date: string) => Promise<void>;
  fetchStockSuggestions: (date: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  salesReport: null,
  stockReport: null,
  stockSuggestions: [],
  selectedDate: new Date().toISOString().split('T')[0],
  loading: false,
  error: null,

  fetchSalesReport: async (date: string) => {
    set({ loading: true, error: null });
    try {
      const response = await reportsApi.getDailySales(date);
      set({ salesReport: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch sales report', loading: false });
    }
  },

  fetchStockReport: async (date: string) => {
    set({ loading: true, error: null });
    try {
      const response = await reportsApi.getDailyStock(date);
      set({ stockReport: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch stock report', loading: false });
    }
  },

  fetchStockSuggestions: async (date: string) => {
    set({ loading: true, error: null });
    try {
      const response = await reportsApi.getStockSuggestions(date);
      set({ stockSuggestions: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch stock suggestions', loading: false });
    }
  },

  setSelectedDate: (date: string) => set({ selectedDate: date }),
}));


