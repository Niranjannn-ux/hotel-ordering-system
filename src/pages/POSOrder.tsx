import { useEffect, useState, useRef } from 'react';
import { useOrderStore } from '../stores/orderStore';
import { useItemStore } from '../stores/itemStore';
import { OrderItem, OrderStatus, PaymentStatus } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { ShoppingCart, X, Plus, Minus, Trash2, Hash, Package, Home, Star, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import './POSOrder.css';

const POSOrder = () => {
  const { currentOrder, orders, loading, fetchOrders, addItemToCurrentOrder, removeItemFromCurrentOrder, updateCurrentOrderItem, clearCurrentOrder, createOrder } = useOrderStore();
  const { items, fetchItems, getItemByNo } = useItemStore();
  const [itemNoInput, setItemNoInput] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [tableNo, setTableNo] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showOrdersList, setShowOrdersList] = useState(true);

  const itemNoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchItems();
    fetchOrders({ date: selectedDate });
  }, [fetchItems, fetchOrders, selectedDate]);

  useEffect(() => {
    // Focus on item number input when component mounts
    itemNoInputRef.current?.focus();
  }, []);

  const handleItemNoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemNo = parseInt(itemNoInput);
    const item = getItemByNo(itemNo);

    if (!item) {
      alert(`Item with number ${itemNo} not found`);
      setItemNoInput('');
      return;
    }

    if (!item.is_active) {
      alert(`Item ${item.name} is not active`);
      setItemNoInput('');
      return;
    }

    const qty = parseFloat(quantity) || 1;
    const orderItem: OrderItem = {
      id: `temp-${Date.now()}-${Math.random()}`,
      item_id: item.id,
      item: item,
      quantity: qty,
      price: item.price,
      subtotal: item.price * qty,
    };

    addItemToCurrentOrder(orderItem);
    setItemNoInput('');
    setQuantity('1');
    itemNoInputRef.current?.focus();
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItemFromCurrentOrder(itemId);
    } else {
      updateCurrentOrderItem(itemId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!currentOrder || currentOrder.items.length === 0) {
      alert('Please add items to the order');
      return;
    }

    setIsProcessing(true);
    try {
      await createOrder({
        table_no: tableNo || undefined,
        items: currentOrder.items.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes,
        })),
        status: OrderStatus.PENDING,
        payment_status: PaymentStatus.PENDING,
      });
      
      alert('Order created successfully!');
      clearCurrentOrder();
      setTableNo('');
      setItemNoInput('');
      setQuantity('1');
      // Refresh orders list
      fetchOrders({ date: selectedDate });
      itemNoInputRef.current?.focus();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const total = currentOrder?.total || 0;

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const recentOrders = orders.slice(0, 10); // Show last 10 orders

  return (
    <div className="pos-order">
      <div className="page-header">
        <div className="breadcrumbs">
          <Home size={16} />
          <span>/</span>
          <span>POS Order Entry</span>
        </div>
        <div className="page-title-section">
          <div>
            <h1>
              <Star size={24} fill="#10b981" />
              POS Order Entry
            </h1>
            <div className="page-subtitle">Enter item numbers to create orders</div>
          </div>
        </div>
      </div>

      <div className="pos-layout">
        <div className="pos-left">
          <Card>
            <form onSubmit={handleItemNoSubmit} className="item-entry-form">
              <div className="form-row">
                <Input
                  ref={itemNoInputRef}
                  label="Item Number"
                  type="number"
                  value={itemNoInput}
                  onChange={(e) => setItemNoInput(e.target.value)}
                  placeholder="Enter item number"
                  autoFocus
                />
                <Input
                  label="Quantity"
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                />
              </div>
              <Button type="submit" variant="primary" className="add-item-btn">
                <Plus size={20} />
                Add Item
              </Button>
            </form>

            <div className="table-input-section">
              <Input
                label="Table Number (Optional)"
                value={tableNo}
                onChange={(e) => setTableNo(e.target.value)}
                placeholder="e.g., T-01"
              />
            </div>
          </Card>

          <Card title="Current Order">
            {!currentOrder || currentOrder.items.length === 0 ? (
              <div className="empty-cart">
                <ShoppingCart size={48} />
                <p>No items in order</p>
                <p className="hint">Enter item number to add items</p>
              </div>
            ) : (
              <div className="order-items">
                {currentOrder.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <div className="item-details">
                      <div className="item-name">{item.item.name}</div>
                      <div className="item-price">${item.price.toFixed(2)} each</div>
                    </div>
                    <div className="item-controls">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="quantity">{item.quantity}</span>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <Plus size={16} />
                      </Button>
                      <Button
                        size="small"
                        variant="danger"
                        onClick={() => removeItemFromCurrentOrder(item.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <div className="item-subtotal">
                      ${item.subtotal.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Order Details Box */}
          {currentOrder && currentOrder.items.length > 0 && (
            <Card title="Order Details" className="order-details-card">
              <div className="order-details-header">
                <div className="order-id-section">
                  <Hash size={18} />
                  <span className="order-id-label">Order ID:</span>
                  <span className="order-id-value">{currentOrder.id || 'Temporary'}</span>
                </div>
                {tableNo && (
                  <div className="table-number-badge">
                    Table {tableNo}
                  </div>
                )}
              </div>
              
              <div className="order-items-table">
                <table>
                  <thead>
                    <tr>
                      <th>Item ID</th>
                      <th>Item No</th>
                      <th>Item Name</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrder.items.map((item, index) => (
                      <tr key={item.id}>
                        <td className="item-id-cell">
                          <code>{item.id.split('-')[1]?.substring(0, 8) || item.id.substring(0, 12)}</code>
                        </td>
                        <td className="item-no-cell">
                          <span className="item-no-badge">#{item.item.item_no}</span>
                        </td>
                        <td className="item-name-cell">{item.item.name}</td>
                        <td className="quantity-cell">{item.quantity}</td>
                        <td className="price-cell">${item.price.toFixed(2)}</td>
                        <td className="subtotal-cell">
                          <strong>${item.subtotal.toFixed(2)}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="total-row">
                      <td colSpan={5} className="total-label">
                        <strong>Total Amount:</strong>
                      </td>
                      <td className="total-amount">
                        <strong>${total.toFixed(2)}</strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          )}
        </div>

        <div className="pos-right">
          <Card className="checkout-card">
            <div className="checkout-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="checkout-actions">
              <Button
                variant="secondary"
                onClick={() => {
                  if (window.confirm('Clear current order?')) {
                    clearCurrentOrder();
                    setTableNo('');
                  }
                }}
                disabled={!currentOrder || currentOrder.items.length === 0}
              >
                <X size={20} />
                Clear
              </Button>
              <Button
                variant="success"
                onClick={handleCheckout}
                disabled={!currentOrder || currentOrder.items.length === 0 || isProcessing}
                className="checkout-btn"
              >
                <ShoppingCart size={20} />
                {isProcessing ? 'Processing...' : 'Checkout'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Orders List for Stock Reference */}
      <Card title="Recent Orders - Stock Reference" className="orders-list-card">
        <div className="orders-list-header">
          <div className="date-filter-section">
            <Calendar size={18} />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-filter-input"
            />
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={() => setShowOrdersList(!showOrdersList)}
          >
            {showOrdersList ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            {showOrdersList ? 'Hide' : 'Show'} Orders
          </Button>
        </div>

        {showOrdersList && (
          <div className="orders-list-content">
            {loading ? (
              <div className="loading-orders">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="no-orders">
                <Package size={48} />
                <p>No orders found for this date</p>
              </div>
            ) : (
              <div className="orders-grid">
                {orders.map((order) => {
                  const isExpanded = expandedOrders.has(order.id);
                  const totalItems = (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
                  
                  return (
                    <div key={order.id} className="order-reference-card">
                      <div 
                        className="order-card-header"
                        onClick={() => toggleOrderExpansion(order.id)}
                      >
                        <div className="order-header-left">
                          <div className="order-id-display">
                            <Hash size={16} />
                            <span className="order-no">{order.order_no || order.id.substring(0, 12)}</span>
                          </div>
                          {order.table_no && (
                            <span className="table-badge">Table {order.table_no}</span>
                          )}
                          <span className={`status-badge status-${order.status}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="order-header-right">
                          <div className="order-summary">
                            <span className="items-count">{totalItems} items</span>
                            <span className="order-total-amount">${(order.total || 0).toFixed(2)}</span>
                          </div>
                          <div className="order-time">
                            {format(new Date(order.created_at), 'HH:mm')}
                          </div>
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="order-details-expanded">
                          <div className="order-items-list">
                            <div className="items-list-header">
                              <span>Item No</span>
                              <span>Item Name</span>
                              <span>Qty</span>
                              <span>Unit Price</span>
                              <span>Subtotal</span>
                            </div>
                            {(order.items || []).map((item) => (
                              <div key={item.id} className="order-item-row">
                                <span className="item-no-ref">#{item.item?.item_no || 'N/A'}</span>
                                <span className="item-name-ref">{item.item?.name || 'Unknown Item'}</span>
                                <span className="item-qty-ref">{item.quantity || 0}</span>
                                <span className="item-price-ref">${(item.price || 0).toFixed(2)}</span>
                                <span className="item-subtotal-ref">
                                  <strong>${(item.subtotal || 0).toFixed(2)}</strong>
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="order-footer-info">
                            <div className="order-meta">
                              <span>Created: {order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy HH:mm') : 'N/A'}</span>
                              {order.completed_at && (
                                <span>Completed: {format(new Date(order.completed_at), 'MMM dd, yyyy HH:mm')}</span>
                              )}
                            </div>
                            <div className="order-total-footer">
                              <strong>Total: ${(order.total || 0).toFixed(2)}</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default POSOrder;

