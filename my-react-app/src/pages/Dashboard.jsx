import React, { useMemo } from 'react';
import { PackageOpen, TrendingUp, AlertCircle, Zap, Activity } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import './Dashboard.css';

export const Dashboard = () => {
  const { inventory, logs, activeWarehouse } = useAppContext();

  const filteredInventory = useMemo(() => {
    if (activeWarehouse === 'All Warehouses') return inventory;
    return inventory.filter(item => item.warehouse === activeWarehouse);
  }, [inventory, activeWarehouse]);

  const totalItems = filteredInventory.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalValue = filteredInventory.reduce((acc, curr) => acc + (curr.quantity * curr.price), 0);
  const lowStockItems = filteredInventory.filter(item => item.quantity <= item.minStock);

  // Chart Data preparation
  const categoryDataDict = filteredInventory.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.quantity;
    return acc;
  }, {});

  const categoryChartData = Object.keys(categoryDataDict).map(key => ({
    name: key,
    value: categoryDataDict[key]
  }));

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b'];

  // AI Suggestions feature
  const getAISuggestions = () => {
    return lowStockItems.map(item => ({
      ...item,
      suggestion: `Demand is trending up. Restock ${Math.ceil(item.minStock * 2.5)} units to prevent stockout next week.`
    })).slice(0, 3);
  };

  const aiSuggestions = getAISuggestions();

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time stats for {activeWarehouse}</p>
        </div>
      </header>

      {/* Stat Cards */}
      <section className="stat-cards-grid">
        <div className="stat-card card">
          <div className="stat-icon-wrap primary">
            <PackageOpen size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Inventory</p>
            <h3 className="stat-value">{totalItems.toLocaleString()} <span className="stat-unit">units</span></h3>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-wrap success">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Value</p>
            <h3 className="stat-value">${totalValue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-wrap danger">
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Low Stock Alerts</p>
            <h3 className="stat-value">{lowStockItems.length} <span className="stat-unit">items</span></h3>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout section */}
      <div className="dashboard-grid">
        
        {/* Left Column */}
        <div className="dashboard-left">
          
          <div className="card chart-card">
            <div className="card-header">
              <h3 className="card-title">Stock Status Overview</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={filteredInventory.slice(0, 8)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: 'none', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} />
                  <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                    {filteredInventory.slice(0, 8).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.quantity <= entry.minStock ? 'var(--danger)' : 'var(--primary-500)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card ai-card">
            <div className="card-header ai-header">
              <Zap size={20} className="ai-icon" />
              <h3 className="card-title">AI Smart Suggestions</h3>
            </div>
            <div className="ai-list">
              {aiSuggestions.length === 0 ? (
                <p className="no-data-text">All stocks look optimal based on current demand patterns.</p>
              ) : (
                aiSuggestions.map(item => (
                  <div key={item.id} className="ai-item">
                    <div className="ai-item-header">
                      <strong>{item.name}</strong> 
                      <span className="badge warning">Only {item.quantity} left</span>
                    </div>
                    <p className="ai-item-suggestion">{item.suggestion}</p>
                    <button className="btn-primary ai-reorder-btn">Auto Draft Po</button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          
          <div className="card min-height-card">
            <div className="card-header">
              <h3 className="card-title">Inventory by Category</h3>
            </div>
            <div className="chart-container pie-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: 'none', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {categoryChartData.map((entry, index) => (
                  <div key={entry.name} className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    <span className="legend-text">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card min-height-card log-card">
            <div className="card-header">
              <Activity size={18} className="text-secondary" />
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="mini-log-list">
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="mini-log-item">
                  <div className={`log-indicator type-${log.action.toLowerCase()}`}></div>
                  <div className="log-details">
                    <p className="log-desc">
                      <strong>{log.user}</strong> {log.action === 'RESTOCK' ? 'restocked' : log.action === 'DISPATCH' ? 'dispatched' : log.action.toLowerCase() + 'ed'} <strong>{log.item}</strong> 
                      {log.qty !== 0 && ` (${log.qty > 0 ? '+' : ''}${log.qty})`}
                    </p>
                    <span className="log-time">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
