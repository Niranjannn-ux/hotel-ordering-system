import { useEffect, useState } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { useTableStore } from '../stores/tableStore';
import { Order, OrderStatus, PaymentStatus } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import { Table as TableIcon, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import './TableOrders.css';

const TableOrders = () => {
  const { orders, fetchOrders, createOrder, updateOrderStatus } = useOrderStore();
  const { tables, fetchTables } = useTableStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  useEffect(() => {
    fetchTables();
    fetchOrders({ date: selectedDate });
  }, [fetchTables, fetchOrders, selectedDate]);

  const handleCreateOrder = async (tableNo: string) => {
    try {
      await createOrder({
        table_no: tableNo,
        items: [],
        status: OrderStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
      });
      fetchOrders({ date: selectedDate });
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      fetchOrders({ date: selectedDate });
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getTableOrders = (tableNo: string) => {
    return orders.filter(
      o => o.table_no === tableNo && o.status !== OrderStatus.SERVED
    );
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return '#f59e0b';
      case OrderStatus.PREPARING:
        return '#3b82f6';
      case OrderStatus.READY:
        return '#10b981';
      case OrderStatus.SERVED:
        return '#6b7280';
      case OrderStatus.CANCELLED:
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="table-orders">
      <div className="page-header">
        <h1>Table Orders</h1>
        <div className="date-filter">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>

      <div className="tables-grid">
        {tables.map((table) => {
          const tableOrders = getTableOrders(table.table_no);
          const hasActiveOrder = tableOrders.length > 0;

          return (
            <Card key={table.id} className="table-card">
              <div className="table-header">
                <div className="table-info">
                  <TableIcon size={24} />
                  <h3>Table {table.table_no}</h3>
                  <span className={`table-status ${table.status}`}>
                    {table.status}
                  </span>
                </div>
                {!hasActiveOrder && (
                  <Button
                    size="small"
                    onClick={() => handleCreateOrder(table.table_no)}
                  >
                    <Plus size={16} />
                    New Order
                  </Button>
                )}
              </div>

              {hasActiveOrder ? (
                <div className="table-orders-list">
                  {tableOrders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <span className="order-no">Order #{order.order_no}</span>
                        <span
                          className="order-status"
                          style={{ color: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="order-items-preview">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="order-item-preview">
                            {item.quantity}x {item.item.name}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="more-items">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                      </div>
                      <div className="order-footer">
                        <span className="order-total">${order.total.toFixed(2)}</span>
                        <div className="order-actions">
                          {order.status === OrderStatus.PENDING && (
                            <Button
                              size="small"
                              variant="success"
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.PREPARING)}
                            >
                              <Clock size={14} />
                              Start
                            </Button>
                          )}
                          {order.status === OrderStatus.PREPARING && (
                            <Button
                              size="small"
                              variant="success"
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.READY)}
                            >
                              <CheckCircle size={14} />
                              Ready
                            </Button>
                          )}
                          {order.status === OrderStatus.READY && (
                            <Button
                              size="small"
                              variant="primary"
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.SERVED)}
                            >
                              <CheckCircle size={14} />
                              Serve
                            </Button>
                          )}
                          {order.status !== OrderStatus.SERVED && (
                            <Button
                              size="small"
                              variant="danger"
                              onClick={() => handleUpdateStatus(order.id, OrderStatus.CANCELLED)}
                            >
                              <XCircle size={14} />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-orders">
                  <p>No active orders</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TableOrders;


