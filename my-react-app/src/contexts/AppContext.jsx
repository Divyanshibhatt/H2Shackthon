import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// API BASE URL
const API_BASE = 'http://localhost:8000';

const warehouses = ['All Warehouses', 'NY-Main', 'SF-Hub', 'TX-Depot'];

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Default to dark for premium feel
  const [userRole, setUserRole] = useState('Admin'); // Admin | Staff
  const [activeWarehouse, setActiveWarehouse] = useState('All Warehouses');
  
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [logs, setLogs] = useState([]);

  // Fetch initial data from backend
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
    } catch (err) {
      console.error("Error fetching data:", err);
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
    try {
      const logData = {
        timestamp: new Date().toISOString(),
        action,
        item,
        qty: Number(qty),
        user: userRole
      };
      const res = await fetch(`${API_BASE}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData)
      });
      if (res.ok) {
        const newLog = await res.json();
        setLogs(prev => [newLog, ...prev]);
      }
    } catch (err) {
      console.error("Error adding log:", err);
    }
  };

  const addItem = async (itemData) => {
    try {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData)
      });
      if (res.ok) {
         const newItem = await res.json();
         setInventory(prev => [newItem, ...prev]);
         await addLog('ADD', newItem.name, newItem.quantity);
      }
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  const updateItem = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
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
      }
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  const deleteItem = async (id) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    try {
      const res = await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await addLog('DELETE', item.name, -item.quantity);
        setInventory(prev => prev.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const addSupplier = async (supplierData) => {
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
      }
    } catch (err) {
      console.error("Error adding supplier:", err);
    }
  };

  const deleteSupplier = async (id) => {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;
    try {
      const res = await fetch(`${API_BASE}/suppliers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await addLog('DELETE', `Supplier: ${supplier.name}`, 0);
        setSuppliers(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
       console.error("Error deleting supplier:", err);
    }
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
