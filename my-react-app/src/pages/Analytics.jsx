import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../contexts/AppContext';
import './Analytics.css';

export const Analytics = () => {
  const { inventory } = useAppContext();

  // Mock trend data
  const data = [
    { name: 'Mon', usage: 120, restock: 400 },
    { name: 'Tue', usage: 150, restock: 300 },
    { name: 'Wed', usage: 180, restock: 200 },
    { name: 'Thu', usage: 220, restock: 278 },
    { name: 'Fri', usage: 280, restock: 189 },
    { name: 'Sat', usage: 90, restock: 239 },
    { name: 'Sun', usage: 70, restock: 349 },
  ];

  return (
    <div className="analytics-page animate-fade-in">
      <header className="page-header">
        <h1 className="page-title">Analytics & Trends</h1>
        <p className="page-subtitle">Historical usage and forecast data</p>
      </header>

      <div className="analytics-grid">
        <div className="card full-width">
          <div className="card-header">
            <h3 className="card-title">Weekly Usage vs Restock Patterns</h3>
          </div>
          <div className="chart-container" style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRestock" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} />
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-surface)', border: 'none', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }} />
                <Area type="monotone" dataKey="usage" stroke="var(--primary-500)" fillOpacity={1} fill="url(#colorUsage)" />
                <Area type="monotone" dataKey="restock" stroke="var(--success)" fillOpacity={1} fill="url(#colorRestock)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
