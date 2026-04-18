import React, { useState, useMemo } from 'react';
import { Search, Plus, Download, Edit2, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, AlertTriangle, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { ItemFormModal } from '../components/ItemFormModal';
import './Inventory.css';

export const Inventory = () => {
  const { inventory, activeWarehouse, deleteItem } = useAppContext();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // holds item to delete

  // Derived state filtering & searching
  const filteredAndSortedItems = useMemo(() => {
    let items = [...inventory];
    
    // 1. Warehouse filter
    if (activeWarehouse !== 'All Warehouses') {
      items = items.filter(i => i.warehouse === activeWarehouse);
    }

    // 2. Category filter
    if (filterCategory !== 'All') {
      items = items.filter(i => i.category === filterCategory);
    }

    // 3. Search text
    if (searchTerm) {
      items = items.filter(i => 
        i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 4. Sort
    items.sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  }, [inventory, activeWarehouse, filterCategory, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleExportCSV = () => {
    const headers = ['ID,Name,Category,Quantity,Price,Supplier,Warehouse'];
    const csvContent = filteredAndSortedItems.map(item => 
      `${item.id},"${item.name}",${item.category},${item.quantity},${item.price},"${item.supplier}",${item.warehouse}`
    );
    const blob = new Blob([headers.concat(csvContent).join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item) => {
    setDeleteConfirm(item);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteItem(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const uniqueCategories = ['All', ...new Set(inventory.map(i => i.category))];

  return (
    <div className="inventory-page animate-fade-in">
      <header className="page-header inventory-header">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Manage your stock across {activeWarehouse}</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleExportCSV}>
            <Download size={18} /> Export
          </button>
          <button className="btn-primary" onClick={openNewModal}>
            <Plus size={18} /> Add Item
          </button>
        </div>
      </header>

      <div className="card table-container-card">
        {/* Table Toolbar */}
        <div className="table-toolbar">
          <div className="search-bar inline-search">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search items or suppliers..." 
              className="search-input"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <select 
            className="input-field filter-select"
            value={filterCategory}
            onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
          >
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {/* Data Table */}
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')}>ID <ArrowUpDown size={14} className="sort-icon" /></th>
                <th onClick={() => handleSort('name')}>Item Name <ArrowUpDown size={14} className="sort-icon" /></th>
                <th onClick={() => handleSort('category')}>Category <ArrowUpDown size={14} className="sort-icon" /></th>
                <th onClick={() => handleSort('quantity')}>Stock <ArrowUpDown size={14} className="sort-icon" /></th>
                <th onClick={() => handleSort('price')}>Price <ArrowUpDown size={14} className="sort-icon" /></th>
                <th>Supplier</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state">No items found matching criteria.</td>
                </tr>
              ) : (
                paginatedItems.map(item => {
                  const isLowStock = item.quantity <= item.minStock;
                  return (
                    <tr key={item.id} className={isLowStock ? 'low-stock-row' : ''}>
                      <td className="text-muted">#{item.id}</td>
                      <td className="font-medium">{item.name}</td>
                      <td><span className="badge normal-bg">{item.category}</span></td>
                      <td>
                        <span className={`badge ${isLowStock ? 'low-stock' : 'in-stock'}`}>
                          {item.quantity} {isLowStock ? '(Low)' : ''}
                        </span>
                      </td>
                      <td>${(Number(item.price) || 0).toLocaleString()}</td>
                      <td className="text-muted">{item.supplier}</td>
                      <td className="action-cells">
                        <button className="icon-btn edit-btn" onClick={() => handleEdit(item)}><Edit2 size={16}/></button>
                        <button className="icon-btn delete-btn" onClick={() => handleDelete(item)}><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <span className="page-info">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} results</span>
            <div className="page-controls">
              <button 
                className="btn-secondary pag-btn" 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="page-number">{currentPage} / {totalPages}</span>
              <button 
                className="btn-secondary pag-btn" 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>

      {isModalOpen && (
        <ItemFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          existingItem={editingItem} 
        />
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Delete Item</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm.name}</strong>? This action cannot be undone.
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
