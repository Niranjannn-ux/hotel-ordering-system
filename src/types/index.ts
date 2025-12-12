export interface Item {
  id: string;
  item_no: number;
  name: string;
  category: string;
  price: number;
  unit: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockEntry {
  id: string;
  item_id: string;
  item: Item;
  date: string;
  starting_stock: number;
  current_stock: number;
  unit: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  item_id: string;
  item: Item;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: string;
  order_no: string;
  table_no?: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  REFUNDED = 'refunded'
}

export interface DailySalesReport {
  date: string;
  total_orders: number;
  total_revenue: number;
  orders_by_status: Record<OrderStatus, number>;
  top_items: Array<{
    item_id: string;
    item_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
}

export interface DailyStockReport {
  date: string;
  items: Array<{
    item_id: string;
    item_name: string;
    starting_stock: number;
    current_stock: number;
    sold_quantity: number;
    unit: string;
  }>;
}

export interface StockSuggestion {
  item_id: string;
  item_name: string;
  current_stock: number;
  average_daily_sales: number;
  days_remaining: number;
  suggestion: 'restock' | 'low_stock' | 'adequate';
  recommended_quantity?: number;
}

export interface Table {
  id: string;
  table_no: string;
  capacity: number;
  status: TableStatus;
  current_order_id?: string;
}

export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved'
}

export interface KDSOrder {
  order_id: string;
  order_no: string;
  table_no?: string;
  items: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    status: OrderItemStatus;
    notes?: string;
  }>;
  created_at: string;
  status: OrderStatus;
}

export enum OrderItemStatus {
  PENDING = 'pending',
  PREPARING = 'preparing',
  READY = 'ready',
  SERVED = 'served'
}


