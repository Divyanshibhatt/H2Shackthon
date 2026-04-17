import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// --- Dummy Data Mocks ---
const mockInventory = [
  { id: '1', name: 'MacBook Pro M3', category: 'Electronics', quantity: 45, price: 1999, supplier: 'Apple Inc', warehouse: 'NY-Main', minStock: 20 },
  { id: '2', name: 'Ergonomic Chair', category: 'Furniture', quantity: 12, price: 350, supplier: 'Herman Miller', warehouse: 'NY-Main', minStock: 15 },
  { id: '3', name: 'Wireless Mouse', category: 'Electronics', quantity: 200, price: 45, supplier: 'Logitech', warehouse: 'SF-Hub', minStock: 50 },
  { id: '4', name: 'Standing Desk', category: 'Furniture', quantity: 5, price: 600, supplier: 'Uplift', warehouse: 'SF-Hub', minStock: 10 },
  { id: '5', name: 'USB-C Cable (2m)', category: 'Accessories', quantity: 8, price: 15, supplier: 'Anker', warehouse: 'NY-Main', minStock: 50 },
  { id: '6', name: 'LED Monitor 27"', category: 'Electronics', quantity: 30, price: 299, supplier: 'Dell', warehouse: 'NY-Main', minStock: 10 },
];

const mockSuppliers = [
  { id: 'S1', name: 'Apple Inc', contact: 'sales@apple.com', status: 'Active' },
  { id: 'S2', name: 'Herman Miller', contact: 'b2b@hermanmiller.com', status: 'Active' },
  { id: 'S3', name: 'Logitech', contact: 'supply@logitech.com', status: 'Active' },
  { id: 'S4', name: 'Uplift', contact: 'orders@upliftdesk.com', status: 'Inactive' },
  { id: 'S5', name: 'Anker', contact: 'wholesale@anker.com', status: 'Active' },
  { id: 'S6', name: 'Dell', contact: 'enterprise@dell.com', status: 'Active' }
];

const mockLogs = [
  { id: 101, timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), action: 'RESTOCK', item: 'Wireless Mouse', qty: +100, user: 'Admin' },
  { id: 102, timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), action: 'DISPATCH', item: 'Standing Desk', qty: -2, user: 'Staff A' },
  { id: 103, timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), action: 'ADD', item: 'USB-C Cable (2m)', qty: 50, user: 'Admin' }
];

const warehouses = ['All Warehouses', 'NY-Main', 'SF-Hub', 'TX-Depot'];

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Default to dark for premium feel
  const [userRole, setUserRole] = useState('Admin'); // Admin | Staff
  const [activeWarehouse, setActiveWarehouse] = useState('All Warehouses');
  
  const [inventory, setInventory] = useState(mockInventory);
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [logs, setLogs] = useState(mockLogs);

  // Sync theme with HTML document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const addLog = (action, item, qty) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action,
      item,
      qty,
      user: userRole
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const addItem = (itemData) => {
    setInventory(prev => {
      const newId = prev.length > 0 ? Math.max(...prev.map(i => parseInt(i.id) || 0)) + 1 : 1;
      const newItem = { ...itemData, id: newId.toString() };
      return [newItem, ...prev];
    });
    addLog('ADD', itemData.name, itemData.quantity);
  };

  const updateItem = (id, updatedData) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        // Track qty changes for logs
        const qtyDiff = updatedData.quantity - item.quantity;
        if (qtyDiff !== 0) {
          addLog(qtyDiff > 0 ? 'RESTOCK' : 'DISPATCH', item.name, qtyDiff);
        } else {
          addLog('UPDATE', item.name, 0); // General edit
        }
        return { ...item, ...updatedData };
      }
      return item;
    }));
  };

  const deleteItem = (id) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      addLog('DELETE', item.name, -item.quantity);
      setInventory(prev => prev.filter(i => i.id !== id));
    }
  };

  const addSupplier = (supplierData) => {
    setSuppliers(prev => {
      const newId = `S${prev.length > 0 ? Math.max(...prev.map(s => parseInt(s.id.substring(1)) || 0)) + 1 : 1}`;
      const newSupplier = { ...supplierData, id: newId };
      return [newSupplier, ...prev];
    });
    addLog('ADD', `Supplier: ${supplierData.name}`, 0);
  };

  const deleteSupplier = (id) => {
    const supplier = suppliers.find(s => s.id === id);
    if (supplier) {
      addLog('DELETE', `Supplier: ${supplier.name}`, 0);
      setSuppliers(prev => prev.filter(s => s.id !== id));
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
