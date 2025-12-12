import { useEffect, useState } from 'react';
import { useItemStore } from '../stores/itemStore';
import { Item } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { Plus, Edit, Trash2, Search, Home, Star, Download, Package } from 'lucide-react';
import './AdminItems.css';

const AdminItems = () => {
  const { items, loading, error, fetchItems, addItem, updateItem, deleteItem } = useItemStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    item_no: '',
    name: '',
    category: '',
    price: '',
    unit: '',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = items.filter((item) => {
    // Apply filter type
    if (filterType === 'active' && !item.is_active) return false;
    if (filterType === 'inactive' && item.is_active) return false;
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchLower) ||
        item.item_no.toString().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleOpenModal = (item?: Item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        item_no: item.item_no.toString(),
        name: item.name,
        category: item.category,
        price: item.price.toString(),
        unit: item.unit,
        description: item.description || '',
        is_active: item.is_active,
      });
    } else {
      setEditingItem(null);
      setFormData({
        item_no: '',
        name: '',
        category: '',
        price: '',
        unit: '',
        description: '',
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const itemData = {
        ...formData,
        item_no: parseInt(formData.item_no),
        price: parseFloat(formData.price),
      };

      if (editingItem) {
        await updateItem(editingItem.id, itemData);
      } else {
        await addItem(itemData);
      }
      
      // Refresh the items list to ensure we have the latest data
      await fetchItems();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save item:', error);
      let errorMessage = 'Failed to save item. Please check your connection and try again.';
      
      if (error.networkError || error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
        errorMessage = `Network Error: Cannot connect to backend API. Please ensure the server is running at ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}`;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const activeItems = items.filter(item => item.is_active).length;
  const inactiveItems = items.filter(item => !item.is_active).length;
  const totalItems = items.length;

  return (
    <div className="admin-items">
      <div className="page-header">
        <div className="breadcrumbs">
          <Home size={16} />
          <span>/</span>
          <span>Item Management</span>
        </div>
        <div className="page-title-section">
          <div className="page-title-group">
            <div>
              <h1>
                <Star size={24} fill="#10b981" />
                Item Management
              </h1>
              <div className="page-subtitle">Manage your menu items and inventory</div>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} variant="success">
            <Plus size={20} />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <Card className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <Package size={24} color="#3b82f6" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Items</div>
            <div className="stat-value">{totalItems}</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>
            <Star size={24} color="#10b981" fill="#10b981" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Items</div>
            <div className="stat-value" style={{ color: '#10b981' }}>{activeItems}</div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>
            <Package size={24} color="#ef4444" />
          </div>
          <div className="stat-content">
            <div className="stat-label">Inactive Items</div>
            <div className="stat-value" style={{ color: '#ef4444' }}>{inactiveItems}</div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="filters-card">
        <div className="filters-row">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filterType === 'all' ? 'active' : ''}`} 
              onClick={() => setFilterType('all')}
            >
              All Items ({totalItems})
            </button>
            <button 
              className={`filter-btn ${filterType === 'active' ? 'active' : ''}`} 
              onClick={() => setFilterType('active')}
            >
              Active ({activeItems})
            </button>
            <button 
              className={`filter-btn ${filterType === 'inactive' ? 'active' : ''}`} 
              onClick={() => setFilterType('inactive')}
            >
              Inactive ({inactiveItems})
            </button>
          </div>
          <div className="search-export-row">
            <div className="search-bar">
              <Search size={20} />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <Button variant="secondary" size="small">
              <Download size={18} />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card>
          <div className="error-message" style={{ 
            color: '#ef4444', 
            padding: '1rem',
            background: '#fee2e2',
            borderRadius: '0.375rem',
            border: '1px solid #ef4444'
          }}>
            <strong>Error:</strong> {error}
            {error.includes('Network Error') && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.875rem' }}>
                <p><strong>To fix this:</strong></p>
                <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                  <li>Make sure your backend API server is running</li>
                  <li>Check that the API URL is correct in your <code>.env</code> file</li>
                  <li>Default API URL: <code>http://localhost:5000/api</code></li>
                  <li>Check the browser console (F12) for more details</li>
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {loading ? (
        <div className="loading">Loading items...</div>
      ) : (
        <Card>
          <div className="items-table">
            <table>
              <thead>
                <tr>
                  <th>Item No</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Unit</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      No items found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.item_no}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.unit}</td>
                      <td>
                        <span className={`status ${item.is_active ? 'active' : 'inactive'}`}>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleOpenModal(item)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="danger"
                            size="small"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? 'Edit Item' : 'Add New Item'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="item-form">
          {submitError && (
            <div className="error-message" style={{ 
              color: '#ef4444', 
              padding: '0.75rem', 
              background: '#fee2e2', 
              borderRadius: '0.375rem',
              marginBottom: '1rem'
            }}>
              {submitError}
            </div>
          )}
          <Input
            label="Item Number"
            type="number"
            value={formData.item_no}
            onChange={(e) => setFormData({ ...formData, item_no: e.target.value })}
            required
          />
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
          <div className="form-row">
            <Input
              label="Price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label="Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., pcs, kg, L"
              required
            />
          </div>
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="form-checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              Active
            </label>
          </div>
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminItems;

