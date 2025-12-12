import { Item, StockEntry, Order, Table } from '../types';

// Mock data storage using localStorage
const STORAGE_KEYS = {
  ITEMS: 'hotelpos_items',
  STOCK: 'hotelpos_stock',
  ORDERS: 'hotelpos_orders',
  TABLES: 'hotelpos_tables',
};

// Helper functions
const getStorage = <T>(key: string, defaultValue: T[]): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

// Mock API that uses localStorage
export const mockApi = {
  items: {
    getAll: async (): Promise<{ data: Item[] }> => {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
      const items = getStorage<Item>(STORAGE_KEYS.ITEMS, []);
      return { data: items };
    },
    
    getById: async (id: string): Promise<{ data: Item }> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const items = getStorage<Item>(STORAGE_KEYS.ITEMS, []);
      const item = items.find(i => i.id === id);
      if (!item) throw new Error('Item not found');
      return { data: item };
    },
    
    create: async (data: Partial<Item>): Promise<{ data: Item }> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const items = getStorage<Item>(STORAGE_KEYS.ITEMS, []);
      const newItem: Item = {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        item_no: data.item_no || 0,
        name: data.name || '',
        category: data.category || '',
        price: data.price || 0,
        unit: data.unit || '',
        description: data.description,
        is_active: data.is_active !== undefined ? data.is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      items.push(newItem);
      setStorage(STORAGE_KEYS.ITEMS, items);
      return { data: newItem };
    },
    
    update: async (id: string, data: Partial<Item>): Promise<{ data: Item }> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const items = getStorage<Item>(STORAGE_KEYS.ITEMS, []);
      const index = items.findIndex(i => i.id === id);
      if (index === -1) throw new Error('Item not found');
      items[index] = {
        ...items[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      setStorage(STORAGE_KEYS.ITEMS, items);
      return { data: items[index] };
    },
    
    delete: async (id: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const items = getStorage<Item>(STORAGE_KEYS.ITEMS, []);
      const filtered = items.filter(i => i.id !== id);
      setStorage(STORAGE_KEYS.ITEMS, filtered);
    },
    
    getByItemNo: async (itemNo: number): Promise<{ data: Item }> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const items = getStorage<Item>(STORAGE_KEYS.ITEMS, []);
      const item = items.find(i => i.item_no === itemNo);
      if (!item) throw new Error('Item not found');
      return { data: item };
    },
  },
  
  stock: {
    getByDate: async (date: string): Promise<{ data: StockEntry[] }> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const entries = getStorage<StockEntry>(STORAGE_KEYS.STOCK, []);
      const items = getStorage<Item>(STORAGE_KEYS.ITEMS, []);
      const filtered = entries
        .filter(e => e.date === date)
        .map(entry => {
          // Populate item data if missing
          if (!entry.item || Object.keys(entry.item).length === 0) {
            const item = items.find(i => i.id === entry.item_id);
            if (item) {
              entry.item = item;
            }
          }
          return entry;
        });
      return { data: filtered };
    },
    
    createEntry: async (data: Partial<StockEntry>): Promise<{ data: StockEntry }> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const entries = getStorage<StockEntry>(STORAGE_KEYS.STOCK, []);
      // Get item details from items storage
      const items = getStorage<Item>(STORAGE_KEYS.ITEMS, []);
      const item = items.find(i => i.id === data.item_id);
      
      const newEntry: StockEntry = {
        id: `stock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        item_id: data.item_id || '',
        item: item || ({} as Item),
        date: data.date || new Date().toISOString().split('T')[0],
        starting_stock: data.starting_stock || 0,
        current_stock: data.current_stock || data.starting_stock || 0,
        unit: data.unit || item?.unit || '',
        notes: data.notes,
      };
      entries.push(newEntry);
      setStorage(STORAGE_KEYS.STOCK, entries);
      return { data: newEntry };
    },
    
    updateEntry: async (id: string, data: Partial<StockEntry>): Promise<{ data: StockEntry }> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const entries = getStorage<StockEntry>(STORAGE_KEYS.STOCK, []);
      const index = entries.findIndex(e => e.id === id);
      if (index === -1) throw new Error('Stock entry not found');
      entries[index] = { ...entries[index], ...data };
      setStorage(STORAGE_KEYS.STOCK, entries);
      return { data: entries[index] };
    },
  },
  
  orders: {
    getAll: async (params?: { date?: string; status?: string }): Promise<{ data: Order[] }> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const orders = getStorage<Order>(STORAGE_KEYS.ORDERS, []);
      let filtered = orders;
      if (params?.date) {
        filtered = filtered.filter(o => o.created_at.startsWith(params.date!));
      }
      if (params?.status) {
        filtered = filtered.filter(o => o.status === params.status);
      }
      return { data: filtered };
    },
    
    create: async (data: Partial<Order>): Promise<{ data: Order }> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const orders = getStorage<Order>(STORAGE_KEYS.ORDERS, []);
      const newOrder: Order = {
        id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        order_no: `ORD-${Date.now()}`,
        table_no: data.table_no,
        items: data.items || [],
        status: data.status || 'pending',
        total: data.total || 0,
        payment_status: data.payment_status || 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      orders.push(newOrder);
      setStorage(STORAGE_KEYS.ORDERS, orders);
      return { data: newOrder };
    },
    
    update: async (id: string, data: Partial<Order>): Promise<{ data: Order }> => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const orders = getStorage<Order>(STORAGE_KEYS.ORDERS, []);
      const index = orders.findIndex(o => o.id === id);
      if (index === -1) throw new Error('Order not found');
      orders[index] = {
        ...orders[index],
        ...data,
        updated_at: new Date().toISOString(),
      };
      setStorage(STORAGE_KEYS.ORDERS, orders);
      return { data: orders[index] };
    },
    
    updateStatus: async (id: string, status: string): Promise<void> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      const orders = getStorage<Order>(STORAGE_KEYS.ORDERS, []);
      const index = orders.findIndex(o => o.id === id);
      if (index !== -1) {
        orders[index].status = status as any;
        orders[index].updated_at = new Date().toISOString();
        setStorage(STORAGE_KEYS.ORDERS, orders);
      }
    },
  },
  
  tables: {
    getAll: async (): Promise<{ data: Table[] }> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      let tables = getStorage<Table>(STORAGE_KEYS.TABLES, []);
      // Initialize default tables if none exist
      if (tables.length === 0) {
        tables = Array.from({ length: 10 }, (_, i) => ({
          id: `table-${i + 1}`,
          table_no: `T-${String(i + 1).padStart(2, '0')}`,
          capacity: 4,
          status: 'available' as any,
        }));
        setStorage(STORAGE_KEYS.TABLES, tables);
      }
      return { data: tables };
    },
  },
};

