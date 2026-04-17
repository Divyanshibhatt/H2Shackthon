import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import '../components/ItemFormModal.css';

export const Suppliers = () => {
  const { suppliers, addSupplier, deleteSupplier } = useAppContext();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', contact: '' });

  const handleOpenModal = () => {
    setFormData({ name: '', contact: '' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) return;
    addSupplier({ name: formData.name, contact: formData.contact, status: 'Active' });
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm('Remove this supplier?')) {
      deleteSupplier(id);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <header className="page-header inventory-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Suppliers Directory</h1>
          <p className="page-subtitle">Manage external warehouse suppliers</p>
        </div>
        <button className="btn-primary" onClick={handleOpenModal}>
          <Plus size={18} /> Add Supplier
        </button>
      </header>

      <div className="card table-container-card">
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Supplier Name</th>
                <th>Contact Email</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 && <tr><td colSpan="5" className="empty-state">No suppliers.</td></tr>}
              {suppliers.map(sup => (
                <tr key={sup.id}>
                  <td className="text-muted">{sup.id}</td>
                  <td className="font-medium">{sup.name}</td>
                  <td>{sup.contact}</td>
                  <td>
                    <span className={`badge ${sup.status === 'Active' ? 'in-stock' : 'low-stock'}`}>
                      {sup.status}
                    </span>
                  </td>
                  <td className="action-cells">
                     <button className="icon-btn delete-btn" onClick={() => handleDelete(sup.id)}><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 10000 }}>
          <div className="modal-content card glass-panel" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Supplier</h2>
              <button className="icon-btn" onClick={handleCloseModal}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Supplier Name</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input-field" 
                  placeholder="e.g. Acme Corp" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input 
                  required
                  type="email"
                  value={formData.contact}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                  className="input-field" 
                  placeholder="e.g. sales@acmecorp.com" 
                />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn-primary">Add Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
