import React from 'react';
import { Search, Bell, Sun, Moon, UserCircle, Cloud, CloudOff } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import './Header.css';

export const Header = () => {
  const { theme, toggleTheme, userRole, warehouses, activeWarehouse, setActiveWarehouse, inventory, isBackendOnline } = useAppContext();
  
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);

  return (
    <header className="top-header glass-panel">
      <div className="header-left">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search inventory..." className="search-input" />
        </div>
        <div className={`connection-status ${isBackendOnline ? 'online' : 'offline'}`} title={isBackendOnline ? 'Database Connected' : 'Database Offline (Preview Mode)'}>
          {isBackendOnline ? <Cloud size={16} /> : <CloudOff size={16} />}
          <span>{isBackendOnline ? 'Connected' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="warehouse-selector">
          <select 
            value={activeWarehouse} 
            onChange={(e) => setActiveWarehouse(e.target.value)}
            className="warehouse-select"
          >
            {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>

        <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button 
          className="icon-btn notifications" 
          title="Notifications"
          onClick={() => {
            if (lowStockItems.length > 0) {
              window.alert(`Alert: You have ${lowStockItems.length} items running low on stock! (${lowStockItems.map(i => i.name).join(', ')})`);
            } else {
              window.alert(`You're all caught up! No low stock alerts.`);
            }
          }}
        >
          <Bell size={20} />
          {lowStockItems.length > 0 && <span className="badge-dot"></span>}
        </button>

        <div className="user-profile">
          <UserCircle size={28} className="user-avatar" />
          <div className="user-info">
            <span className="user-name">Demo User</span>
            <span className="user-role">{userRole}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
