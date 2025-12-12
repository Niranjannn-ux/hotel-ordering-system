import { create } from 'zustand';
import { Table, TableStatus } from '../types';
import { tablesApi } from '../services/api';

interface TableStore {
  tables: Table[];
  loading: boolean;
  error: string | null;
  fetchTables: () => Promise<void>;
  updateTableStatus: (id: string, status: TableStatus) => Promise<void>;
  getTableByNo: (tableNo: string) => Table | undefined;
}

export const useTableStore = create<TableStore>((set, get) => ({
  tables: [],
  loading: false,
  error: null,

  fetchTables: async () => {
    set({ loading: true, error: null });
    try {
      const response = await tablesApi.getAll();
      set({ tables: response.data, loading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch tables', loading: false });
    }
  },

  updateTableStatus: async (id: string, status: TableStatus) => {
    set({ loading: true, error: null });
    try {
      await tablesApi.updateStatus(id, status);
      set(state => ({
        tables: state.tables.map(t =>
          t.id === id ? { ...t, status } : t
        ),
        loading: false
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to update table status', loading: false });
    }
  },

  getTableByNo: (tableNo: string) => {
    return get().tables.find(t => t.table_no === tableNo);
  },
}));


