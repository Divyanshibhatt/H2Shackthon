import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import './ItemFormModal.css';

export const ItemFormModal = ({ isOpen, onClose, existingItem }) => {
  const { addItem, updateItem, warehouses, suppliers } = useAppContext();
  
  const defaultState = {
    name: '',
    category: '',
    quantity: '',
    price: '',
    minStock: 10,
    supplier: suppliers[0]?.name || '',
    warehouse: warehouses.filter(w => w !== 'All Warehouses')[0] || ''
  };

  const [formData, setFormData] = useState(defaultState);

  useEffect(() => {
    if (existingItem) {
      setFormData(existingItem);
    } else {
      setFormData(defaultState);
    }
    // eslint-disable-next-line
  }, [existingItem]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (existingItem) {
      updateItem(existingItem.id, formData);
    } else {
      addItem(formData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content card glass-panel">
        <div className="modal-header">
          <h2 className="modal-title">{existingItem ? 'Edit Inventory Item' : 'Add New Item'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input 
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field" 
              placeholder="e.g. Wireless Keyboard" 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <input 
                required
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field" 
                placeholder="e.g. Electronics" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Warehouse</label>
              <select name="warehouse" value={formData.warehouse} onChange={handleChange} className="input-field">
                {warehouses.filter(w => w !== 'All Warehouses').map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input 
                required
                type="number"
                min="0"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="input-field" 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price ($)</label>
              <input 
                required
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="input-field" 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Min Stock Threshold</label>
              <input 
                required
                type="number"
                min="0"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                className="input-field" 
                title="Alert triggers below this level"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Supplier</label>
              {suppliers.length > 0 ? (
                <select name="supplier" value={formData.supplier} onChange={handleChange} className="input-field">
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <input 
                  required
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="input-field" 
                  placeholder="e.g. Acme Corp" 
                />
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">{existingItem ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
