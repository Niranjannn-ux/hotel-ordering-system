import { useEffect, useState } from 'react';
import { useStockStore } from '../stores/stockStore';
import { useItemStore } from '../stores/itemStore';
import { StockEntry as StockEntryType } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { Plus, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';
import './StockEntry.css';

const StockEntry = () => {
  const { stockEntries, selectedDate, loading, fetchStockByDate, createStockEntry, updateStockEntry, setSelectedDate } = useStockStore();
  const { items, fetchItems } = useItemStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<StockEntryType | null>(null);
  const [formData, setFormData] = useState({
    item_id: '',
    date: selectedDate,
    starting_stock: '',
    notes: '',
  });

  useEffect(() => {
    fetchItems();
    fetchStockByDate(selectedDate);
  }, [fetchItems, fetchStockByDate, selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    fetchStockByDate(date);
  };

  const handleOpenModal = (entry?: StockEntryType) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        item_id: entry.item_id,
        date: entry.date,
        starting_stock: entry.starting_stock.toString(),
        notes: entry.notes || '',
      });
    } else {
      setEditingEntry(null);
      setFormData({
        item_id: '',
        date: selectedDate,
        starting_stock: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const entryData = {
        ...formData,
        starting_stock: parseFloat(formData.starting_stock),
        current_stock: parseFloat(formData.starting_stock),
      };

      if (editingEntry) {
        await updateStockEntry(editingEntry.id, entryData);
      } else {
        await createStockEntry(entryData);
      }
      handleCloseModal();
      fetchStockByDate(selectedDate);
    } catch (error) {
      console.error('Failed to save stock entry:', error);
    }
  };

  const getItemName = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    return item ? `${item.item_no} - ${item.name}` : 'Unknown Item';
  };

  return (
    <div className="stock-entry">
      <div className="page-header">
        <h1>Stock Entry</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Add Stock Entry
        </Button>
      </div>

      <Card>
        <div className="date-selector">
          <Calendar size={20} />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            label="Select Date"
          />
        </div>
      </Card>

      {loading ? (
        <div className="loading">Loading stock entries...</div>
      ) : (
        <Card>
          <div className="stock-table">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Starting Stock</th>
                  <th>Current Stock</th>
                  <th>Unit</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stockEntries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      No stock entries for this date. Add entries to get started.
                    </td>
                  </tr>
                ) : (
                  stockEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <div className="item-info">
                          <Package size={16} />
                          <span>{getItemName(entry.item_id)}</span>
                        </div>
                      </td>
                      <td>{entry.starting_stock}</td>
                      <td>
                        <span className={`stock-amount ${entry.current_stock < entry.starting_stock * 0.2 ? 'low' : ''}`}>
                          {entry.current_stock}
                        </span>
                      </td>
                      <td>{entry.unit}</td>
                      <td>{format(new Date(entry.date), 'MMM dd, yyyy')}</td>
                      <td>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => handleOpenModal(entry)}
                        >
                          Edit
                        </Button>
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
        title={editingEntry ? 'Edit Stock Entry' : 'Add Stock Entry'}
        size="medium"
      >
        <form onSubmit={handleSubmit} className="stock-form">
          <div className="form-group">
            <label className="input-label">Item</label>
            <select
              className="input"
              value={formData.item_id}
              onChange={(e) => setFormData({ ...formData, item_id: e.target.value })}
              required
              disabled={!!editingEntry}
            >
              <option value="">Select an item</option>
              {items.filter(i => i.is_active).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_no} - {item.name} ({item.unit})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <Input
            label="Starting Stock"
            type="number"
            step="0.01"
            value={formData.starting_stock}
            onChange={(e) => setFormData({ ...formData, starting_stock: e.target.value })}
            required
          />
          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div className="form-actions">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingEntry ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockEntry;

