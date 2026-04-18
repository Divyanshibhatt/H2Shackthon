import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// API BASE URL
const API_BASE = 'http://localhost:8000';

const warehouses = ['All Warehouses', 'NY-Main', 'SF-Hub', 'TX-Depot'];

// --- Fallback Mock Data (used when backend is offline) ---
const mockInventory = [
  { id: 1, name: 'MacBook Pro M3', category: 'Electronics', quantity: 45, price: 1999, supplier: 'Apple Inc', warehouse: 'NY-Main', minStock: 20 },
  { id: 2, name: 'Ergonomic Chair', category: 'Furniture', quantity: 12, price: 350, supplier: 'Herman Miller', warehouse: 'NY-Main', minStock: 15 },
  { id: 3, name: 'Wireless Mouse', category: 'Electronics', quantity: 200, price: 45, supplier: 'Logitech', warehouse: 'SF-Hub', minStock: 50 },
  { id: 4, name: 'Standing Desk', category: 'Furniture', quantity: 5, price: 600, supplier: 'Uplift', warehouse: 'SF-Hub', minStock: 10 },
  { id: 5, name: 'USB-C Cable (2m)', category: 'Accessories', quantity: 8, price: 15, supplier: 'Anker', warehouse: 'NY-Main', minStock: 50 },
  { id: 6, name: 'LED Monitor 27"', category: 'Electronics', quantity: 30, price: 299, supplier: 'Dell', warehouse: 'NY-Main', minStock: 10 },
];
const mockSuppliers = [
  { id: 1, name: 'Apple Inc', contact: 'sales@apple.com', status: 'Active' },
  { id: 2, name: 'Herman Miller', contact: 'b2b@hermanmiller.com', status: 'Active' },
  { id: 3, name: 'Logitech', contact: 'supply@logitech.com', status: 'Active' },
  { id: 4, name: 'Uplift', contact: 'orders@upliftdesk.com', status: 'Inactive' },
  { id: 5, name: 'Anker', contact: 'wholesale@anker.com', status: 'Active' },
  { id: 6, name: 'Dell', contact: 'enterprise@dell.com', status: 'Active' },
];
const mockLogs = [
  { id: 1, timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), action: 'RESTOCK', item: 'Wireless Mouse', qty: 100, user: 'Admin' },
  { id: 2, timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), action: 'DISPATCH', item: 'Standing Desk', qty: -2, user: 'Staff A' },
  { id: 3, timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), action: 'ADD', item: 'USB-C Cable (2m)', qty: 50, user: 'Admin' },
];

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [userRole, setUserRole] = useState('Admin');
  const [activeWarehouse, setActiveWarehouse] = useState('All Warehouses');
  
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  // Fetch initial data from backend, fall back to mock data
  const fetchData = async () => {
    try {
      const [invRes, supRes, logRes] = await Promise.all([
        fetch(`${API_BASE}/items`),
        fetch(`${API_BASE}/suppliers`),
        fetch(`${API_BASE}/logs`)
      ]);
      const invData = await invRes.json();
      const supData = await supRes.json();
      const logData = await logRes.json();
      
      setInventory(invData || []);
      setSuppliers(supData || []);
      setLogs(logData || []);
      setIsBackendOnline(true);
    } catch (err) {
      console.warn("Backend offline, using local mock data.", err);
      setInventory(mockInventory);
      setSuppliers(mockSuppliers);
      setLogs(mockLogs);
      setIsBackendOnline(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync theme with HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addLog = async (action, item, qty) => {
    const logData = {
      timestamp: new Date().toISOString(),
      action,
      item,
      qty: Number(qty) || 0,
      user: userRole
    };
    if (isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE}/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData)
        });
        if (res.ok) {
          const newLog = await res.json();
          setLogs(prev => [newLog, ...prev]);
          return;
        }
      } catch (err) {
        console.error("Error adding log:", err);
      }
    }
    // Fallback: local-only log
    const newLog = { ...logData, id: Date.now() };
    setLogs(prev => [newLog, ...prev]);
  };

  const addItem = async (itemData) => {
    const cleanData = {
      ...itemData,
      quantity: Number(itemData.quantity) || 0,
      price: Number(itemData.price) || 0,
      minStock: Number(itemData.minStock) || 10,
    };
    if (isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanData)
        });
        if (res.ok) {
          const newItem = await res.json();
          setInventory(prev => [newItem, ...prev]);
          await addLog('ADD', newItem.name, newItem.quantity);
          return;
        }
      } catch (err) {
        console.error("Error adding item:", err);
      }
    }
    // Fallback: local-only add
    setInventory(prev => {
      const newId = prev.length > 0 ? Math.max(...prev.map(i => Number(i.id) || 0)) + 1 : 1;
      return [{ ...cleanData, id: newId }, ...prev];
    });
    addLog('ADD', cleanData.name, cleanData.quantity);
  };

  const updateItem = async (id, updatedData) => {
    const cleanData = {
      ...updatedData,
      quantity: Number(updatedData.quantity) || 0,
      price: Number(updatedData.price) || 0,
      minStock: Number(updatedData.minStock) || 10,
    };
    if (isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE}/items/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanData)
        });
        if (res.ok) {
          const newItem = await res.json();
          setInventory(prev => prev.map(item => {
            if (item.id === id) {
              const qtyDiff = newItem.quantity - item.quantity;
              if (qtyDiff !== 0) {
                addLog(qtyDiff > 0 ? 'RESTOCK' : 'DISPATCH', item.name, qtyDiff);
              } else {
                addLog('UPDATE', item.name, 0);
              }
              return newItem;
            }
            return item;
          }));
          return;
        }
      } catch (err) {
        console.error("Error updating item:", err);
      }
    }
    // Fallback: local-only update
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const qtyDiff = cleanData.quantity - item.quantity;
        if (qtyDiff !== 0) {
          addLog(qtyDiff > 0 ? 'RESTOCK' : 'DISPATCH', item.name, qtyDiff);
        } else {
          addLog('UPDATE', item.name, 0);
        }
        return { ...item, ...cleanData };
      }
      return item;
    }));
  };

  const deleteItem = async (id) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    if (isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
        if (res.ok) {
          await addLog('DELETE', item.name, -item.quantity);
          setInventory(prev => prev.filter(i => i.id !== id));
          return;
        }
      } catch (err) {
        console.error("Error deleting item:", err);
      }
    }
    // Fallback: local-only delete
    await addLog('DELETE', item.name, -item.quantity);
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const addSupplier = async (supplierData) => {
    if (isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE}/suppliers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(supplierData)
        });
        if (res.ok) {
          const newSupplier = await res.json();
          setSuppliers(prev => [newSupplier, ...prev]);
          await addLog('ADD', `Supplier: ${newSupplier.name}`, 0);
          return;
        }
      } catch (err) {
        console.error("Error adding supplier:", err);
      }
    }
    // Fallback: local-only add
    setSuppliers(prev => {
      const newId = prev.length > 0 ? Math.max(...prev.map(s => Number(s.id) || 0)) + 1 : 1;
      return [{ ...supplierData, id: newId }, ...prev];
    });
    addLog('ADD', `Supplier: ${supplierData.name}`, 0);
  };

  const deleteSupplier = async (id) => {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;
    if (isBackendOnline) {
      try {
        const res = await fetch(`${API_BASE}/suppliers/${id}`, { method: 'DELETE' });
        if (res.ok) {
          await addLog('DELETE', `Supplier: ${supplier.name}`, 0);
          setSuppliers(prev => prev.filter(s => s.id !== id));
          return;
        }
      } catch (err) {
        console.error("Error deleting supplier:", err);
      }
    }
    // Fallback: local-only delete
    await addLog('DELETE', `Supplier: ${supplier.name}`, 0);
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const value = {
    theme, toggleTheme,
    userRole, setUserRole,
    warehouses, activeWarehouse, setActiveWarehouse,
    inventory, addItem, updateItem, deleteItem,
    suppliers, addSupplier, deleteSupplier,
    logs, addLog
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
