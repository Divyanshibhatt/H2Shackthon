import React, { useMemo, useState, useRef, useEffect } from 'react';
import { PackageOpen, TrendingUp, AlertCircle, Activity, Sparkles, Send, Loader } from 'lucide-react';
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

  // --- AI Chat State ---
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m your Inventory Analyst. Ask me anything about your stock, suppliers, or trends.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAiSend = async () => {
    const question = chatInput.trim();
    if (!question || isAiLoading) return;

    setChatMessages(prev => [...prev, { role: 'user', text: question }]);
    setChatInput('');
    setIsAiLoading(true);

    // Build context from live inventory data
    const inventorySummary = filteredInventory.map(i =>
      `- ${i.name}: ${i.quantity} units, $${i.price}, category=${i.category}, warehouse=${i.warehouse}, minStock=${i.minStock}`
    ).join('\n');
    const lowStockSummary = lowStockItems.map(i => `${i.name} (${i.quantity}/${i.minStock})`).join(', ');

    const systemPrompt = `You are an AI inventory analyst for a warehouse management system. Answer concisely in 2-3 sentences MAX. Use the live data below.

Inventory (${filteredInventory.length} items, total ${totalItems} units, value $${totalValue.toFixed(2)}):
${inventorySummary}

Low stock items: ${lowStockSummary || 'None'}
Active warehouse: ${activeWarehouse}`;

    try {
      const res = await fetch('http://localhost:8000/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:1b',
          prompt: question,
          system: systemPrompt,
          stream: false
        })
      });
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'ai', text: data.response || data.error || 'Sorry, I couldn\'t process that.' }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: '⚠️ Ollama is not running. Start it with: open -a Ollama' }]);
    }
    setIsAiLoading(false);
  };



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

          {/* AI Chat Section */}
          <div className="card ai-chat-card">
            <div className="card-header ai-chat-header">
              <Sparkles size={18} className="ai-sparkle" />
              <h3 className="card-title">AI Inventory Analyst</h3>
              <span className="ai-model-badge">llama3.2</span>
            </div>
            <div className="ai-chat-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`ai-msg ${msg.role}`}>
                  {msg.role === 'ai' && <Sparkles size={14} className="ai-msg-icon" />}
                  <p>{msg.text}</p>
                </div>
              ))}
              {isAiLoading && (
                <div className="ai-msg ai">
                  <Loader size={14} className="ai-msg-icon spin" />
                  <p>Analyzing your data...</p>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form className="ai-chat-input-row" onSubmit={(e) => { e.preventDefault(); handleAiSend(); }}>
              <input
                className="input-field ai-chat-input"
                placeholder="Ask about your inventory..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn-primary ai-send-btn" disabled={isAiLoading}>
                <Send size={16} />
              </button>
            </form>
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
