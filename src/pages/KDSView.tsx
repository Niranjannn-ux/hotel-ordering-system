import { useEffect, useState } from 'react';
import { socketService } from '../services/socket';
import { KDSOrder, OrderItemStatus } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import { Monitor, Clock, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import './KDSView.css';

const KDSView = () => {
  const [orders, setOrders] = useState<KDSOrder[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'preparing'>('all');

  useEffect(() => {
    const socket = socketService.connect();
    
    const handleOrderUpdate = (order: KDSOrder) => {
      setOrders((prev) => {
        const existingIndex = prev.findIndex((o) => o.order_id === order.order_id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = order;
          return updated;
        } else {
          return [order, ...prev];
        }
      });
    };

    socketService.subscribeToKDSUpdates(handleOrderUpdate);

    // Simulate initial orders (in real app, fetch from API)
    // This would typically come from an API call
    // fetchKDSOrders().then(setOrders);

    return () => {
      socketService.unsubscribeFromKDSUpdates();
    };
  }, []);

  const handleItemStatusUpdate = (orderId: string, itemId: string, status: OrderItemStatus) => {
    // In real app, emit socket event or call API
    setOrders((prev) =>
      prev.map((order) => {
        if (order.order_id === orderId) {
          return {
            ...order,
            items: order.items.map((item) =>
              item.item_id === itemId ? { ...item, status } : item
            ),
          };
        }
        return order;
      })
    );
  };

  const handleOrderComplete = (orderId: string) => {
    setOrders((prev) => prev.filter((order) => order.order_id !== orderId));
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    if (filter === 'pending') {
      return order.items.some((item) => item.status === OrderItemStatus.PENDING);
    }
    if (filter === 'preparing') {
      return order.items.some((item) => item.status === OrderItemStatus.PREPARING);
    }
    return true;
  });

  const getStatusColor = (status: OrderItemStatus) => {
    switch (status) {
      case OrderItemStatus.PENDING:
        return '#f59e0b';
      case OrderItemStatus.PREPARING:
        return '#3b82f6';
      case OrderItemStatus.READY:
        return '#10b981';
      case OrderItemStatus.SERVED:
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="kds-view">
      <div className="page-header">
        <div className="header-left">
          <Monitor size={32} />
          <h1>Kitchen Display System</h1>
        </div>
        <div className="filters">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Orders
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${filter === 'preparing' ? 'active' : ''}`}
            onClick={() => setFilter('preparing')}
          >
            Preparing
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <div className="empty-kds">
            <Monitor size={64} />
            <h2>No Active Orders</h2>
            <p>Orders will appear here in real-time</p>
          </div>
        </Card>
      ) : (
        <div className="kds-grid">
          {filteredOrders.map((order) => (
            <Card key={order.order_id} className="kds-order-card">
              <div className="kds-order-header">
                <div>
                  <div className="order-number">Order #{order.order_no}</div>
                  {order.table_no && (
                    <div className="table-number">Table {order.table_no}</div>
                  )}
                  <div className="order-time">
                    {format(new Date(order.created_at), 'HH:mm:ss')}
                  </div>
                </div>
                <Button
                  size="small"
                  variant="success"
                  onClick={() => handleOrderComplete(order.order_id)}
                >
                  <CheckCircle size={16} />
                  Complete
                </Button>
              </div>

              <div className="kds-items">
                {order.items.map((item) => (
                  <div
                    key={item.item_id}
                    className={`kds-item ${item.status}`}
                    style={{ borderLeftColor: getStatusColor(item.status) }}
                  >
                    <div className="item-header">
                      <div className="item-quantity">{item.quantity}x</div>
                      <div className="item-name">{item.item_name}</div>
                      <span
                        className="item-status-badge"
                        style={{ backgroundColor: getStatusColor(item.status) }}
                      >
                        {item.status}
                      </span>
                    </div>
                    {item.notes && (
                      <div className="item-notes">Note: {item.notes}</div>
                    )}
                    <div className="item-actions">
                      {item.status === OrderItemStatus.PENDING && (
                        <Button
                          size="small"
                          variant="primary"
                          onClick={() =>
                            handleItemStatusUpdate(
                              order.order_id,
                              item.item_id,
                              OrderItemStatus.PREPARING
                            )
                          }
                        >
                          <Clock size={14} />
                          Start
                        </Button>
                      )}
                      {item.status === OrderItemStatus.PREPARING && (
                        <Button
                          size="small"
                          variant="success"
                          onClick={() =>
                            handleItemStatusUpdate(
                              order.order_id,
                              item.item_id,
                              OrderItemStatus.READY
                            )
                          }
                        >
                          <CheckCircle size={14} />
                          Ready
                        </Button>
                      )}
                      {item.status === OrderItemStatus.READY && (
                        <div className="ready-indicator">
                          <CheckCircle size={20} />
                          <span>Ready for Service</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default KDSView;


