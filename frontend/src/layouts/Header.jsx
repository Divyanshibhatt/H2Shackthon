import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, UserCircle, Cloud, CloudOff, AlertTriangle, PackageOpen, X } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import './Header.css';

export const Header = () => {
  const { theme, toggleTheme, userRole, warehouses, activeWarehouse, setActiveWarehouse, inventory, isBackendOnline } = useAppContext();
  
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStock);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        
        {/* Notification Bell + Dropdown */}
        <div className="notif-wrapper" ref={notifRef}>
          <button 
            className="icon-btn notifications" 
            title="Notifications"
            onClick={() => setIsNotifOpen(prev => !prev)}
          >
            <Bell size={20} />
            {lowStockItems.length > 0 && <span className="badge-dot">{lowStockItems.length}</span>}
          </button>

          {isNotifOpen && (
            <div className="notif-dropdown animate-fade-in">
              <div className="notif-dropdown-header">
                <h4>Notifications</h4>
                <button className="icon-btn" onClick={() => setIsNotifOpen(false)}><X size={16} /></button>
              </div>

              <div className="notif-dropdown-body">
                {lowStockItems.length === 0 ? (
                  <div className="notif-empty">
                    <PackageOpen size={32} style={{ color: 'var(--text-muted)' }} />
                    <p>You're all caught up!</p>
                    <span>No low stock alerts right now.</span>
                  </div>
                ) : (
                  lowStockItems.map(item => (
                    <div key={item.id} className="notif-item">
                      <div className="notif-icon-wrap">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="notif-item-content">
                        <p className="notif-item-title">{item.name}</p>
                        <p className="notif-item-desc">
                          Only <strong>{item.quantity}</strong> left — min is {item.minStock}
                        </p>
                      </div>
                      <span className="notif-item-badge">{item.warehouse}</span>
                    </div>
                  ))
                )}
              </div>

              {lowStockItems.length > 0 && (
                <div className="notif-dropdown-footer">
                  {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} need attention
                </div>
              )}
            </div>
          )}
        </div>

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
