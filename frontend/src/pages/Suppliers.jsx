import React, { useState } from 'react';
import { Plus, Trash2, X, AlertTriangle } from 'lucide-react';
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

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDelete = (supplier) => {
    setDeleteConfirm(supplier);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteSupplier(deleteConfirm.id);
      setDeleteConfirm(null);
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
                     <button className="icon-btn delete-btn" onClick={() => handleDelete(sup)}><Trash2 size={16}/></button>
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

      {deleteConfirm && (
        <div className="modal-overlay animate-fade-in" style={{ zIndex: 10000 }}>
          <div className="modal-content card glass-panel" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div className="modal-header" style={{ justifyContent: 'flex-end' }}>
              <button className="icon-btn" onClick={() => setDeleteConfirm(null)}><X size={24} /></button>
            </div>
            <div style={{ padding: '0.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'var(--danger-bg)', display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}>
                <AlertTriangle size={28} style={{ color: 'var(--danger)' }} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Remove Supplier</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Are you sure you want to remove <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.name}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', width: '100%' }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button style={{
                  flex: 1, padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
                  fontWeight: 500, background: 'var(--danger)', color: '#fff',
                  transition: 'all 150ms ease'
                }} onClick={confirmDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
