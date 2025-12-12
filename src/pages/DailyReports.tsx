import { useEffect, useState } from 'react';
import { useReportStore } from '../stores/reportStore';
import Card from '../components/Card';
import Button from '../components/Button';
import { Calendar, TrendingUp, Package, AlertTriangle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import './DailyReports.css';

const DailyReports = () => {
  const {
    salesReport,
    stockReport,
    stockSuggestions,
    selectedDate,
    loading,
    fetchSalesReport,
    fetchStockReport,
    fetchStockSuggestions,
    setSelectedDate,
  } = useReportStore();
  const [activeTab, setActiveTab] = useState<'sales' | 'stock' | 'suggestions'>('sales');

  useEffect(() => {
    loadReports();
  }, [selectedDate]);

  const loadReports = async () => {
    if (activeTab === 'sales') {
      await fetchSalesReport(selectedDate);
    } else if (activeTab === 'stock') {
      await fetchStockReport(selectedDate);
    } else {
      await fetchStockSuggestions(selectedDate);
    }
  };

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const handleRefresh = () => {
    loadReports();
  };

  return (
    <div className="daily-reports">
      <div className="page-header">
        <h1>Daily Reports</h1>
        <div className="header-actions">
          <div className="date-selector">
            <Calendar size={20} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>
          <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={20} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <TrendingUp size={20} />
          Sales Report
        </button>
        <button
          className={`tab ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('stock')}
        >
          <Package size={20} />
          Stock Report
        </button>
        <button
          className={`tab ${activeTab === 'suggestions' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          <AlertTriangle size={20} />
          Stock Suggestions
        </button>
      </div>

      {loading ? (
        <Card>
          <div className="loading">Loading report...</div>
        </Card>
      ) : (
        <>
          {activeTab === 'sales' && (
            <div className="reports-content">
              {salesReport ? (
                <>
                  <div className="stats-grid">
                    <Card>
                      <div className="stat-card">
                        <div className="stat-label">Total Orders</div>
                        <div className="stat-value">{salesReport.total_orders}</div>
                      </div>
                    </Card>
                    <Card>
                      <div className="stat-card">
                        <div className="stat-label">Total Revenue</div>
                        <div className="stat-value">${salesReport.total_revenue.toFixed(2)}</div>
                      </div>
                    </Card>
                    <Card>
                      <div className="stat-card">
                        <div className="stat-label">Pending Orders</div>
                        <div className="stat-value">{salesReport.orders_by_status.pending || 0}</div>
                      </div>
                    </Card>
                    <Card>
                      <div className="stat-card">
                        <div className="stat-label">Served Orders</div>
                        <div className="stat-value">{salesReport.orders_by_status.served || 0}</div>
                      </div>
                    </Card>
                  </div>

                  <Card title="Top Selling Items">
                    <div className="top-items-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Quantity Sold</th>
                            <th>Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {salesReport.top_items.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="empty-state">
                                No sales data for this date
                              </td>
                            </tr>
                          ) : (
                            salesReport.top_items.map((item, index) => (
                              <tr key={item.item_id}>
                                <td>
                                  <span className="rank">#{index + 1}</span>
                                  {item.item_name}
                                </td>
                                <td>{item.quantity_sold}</td>
                                <td>${item.revenue.toFixed(2)}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              ) : (
                <Card>
                  <div className="empty-state">No sales data available for this date</div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'stock' && (
            <Card>
              {stockReport ? (
                <div className="stock-report-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Starting Stock</th>
                        <th>Current Stock</th>
                        <th>Sold Quantity</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockReport.items.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="empty-state">
                            No stock data for this date
                          </td>
                        </tr>
                      ) : (
                        stockReport.items.map((item) => {
                          const stockPercentage = (item.current_stock / item.starting_stock) * 100;
                          return (
                            <tr key={item.item_id}>
                              <td>{item.item_name}</td>
                              <td>{item.starting_stock}</td>
                              <td>
                                <div className="stock-bar-container">
                                  <span>{item.current_stock}</span>
                                  <div className="stock-bar">
                                    <div
                                      className={`stock-bar-fill ${
                                        stockPercentage < 20 ? 'low' : stockPercentage < 50 ? 'medium' : 'high'
                                      }`}
                                      style={{ width: `${stockPercentage}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td>{item.sold_quantity}</td>
                              <td>{item.unit}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">No stock data available for this date</div>
              )}
            </Card>
          )}

          {activeTab === 'suggestions' && (
            <Card>
              {stockSuggestions.length > 0 ? (
                <div className="suggestions-list">
                  {stockSuggestions.map((suggestion) => (
                    <div
                      key={suggestion.item_id}
                      className={`suggestion-card ${suggestion.suggestion}`}
                    >
                      <div className="suggestion-header">
                        <h3>{suggestion.item_name}</h3>
                        <span className={`suggestion-badge ${suggestion.suggestion}`}>
                          {suggestion.suggestion === 'restock' ? 'Restock Now' :
                           suggestion.suggestion === 'low_stock' ? 'Low Stock' : 'Adequate'}
                        </span>
                      </div>
                      <div className="suggestion-details">
                        <div className="detail-item">
                          <span>Current Stock:</span>
                          <span>{suggestion.current_stock}</span>
                        </div>
                        <div className="detail-item">
                          <span>Avg Daily Sales:</span>
                          <span>{suggestion.average_daily_sales.toFixed(2)}</span>
                        </div>
                        <div className="detail-item">
                          <span>Days Remaining:</span>
                          <span>{suggestion.days_remaining.toFixed(1)} days</span>
                        </div>
                        {suggestion.recommended_quantity && (
                          <div className="detail-item highlight">
                            <span>Recommended Quantity:</span>
                            <span>{suggestion.recommended_quantity}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No stock suggestions for this date</div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DailyReports;


