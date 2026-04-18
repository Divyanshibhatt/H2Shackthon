import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, BarChart3, Users, Clock, Settings, PackagePlus } from 'lucide-react';
import './Sidebar.css';

export const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Inventory', path: '/inventory', icon: <Package size={20} /> },
    { name: 'Suppliers', path: '/suppliers', icon: <Users size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Activity Logs', path: '/logs', icon: <Clock size={20} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <PackagePlus className="logo-icon" size={28} />
        <h1 className="logo-text">StockFlow</h1>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink 
            key={item.name} 
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <NavLink to="/login" className="nav-link settings-link">
          <Settings size={20} />
          <span>Switch Role</span>
        </NavLink>
      </div>
    </aside>
  );
};
