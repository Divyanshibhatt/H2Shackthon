import React from 'react';
import { useAppContext } from '../contexts/AppContext';

export const ActivityLogs = () => {
  const { logs } = useAppContext();

  return (
    <div className="page-container animate-fade-in">
      <header className="page-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Activity Logs</h1>
        <p className="page-subtitle">Comprehensive audit trail of inventory changes</p>
      </header>

      <div className="card table-container-card">
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Item</th>
                <th>Quantity Shift</th>
                <th>Performed By</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && <tr><td colSpan="5" className="empty-state">No logs recorded yet.</td></tr>}
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`badge type-${log.action.toLowerCase()}`} style={{
                      backgroundColor: log.action === 'RESTOCK' || log.action === 'ADD' ? 'var(--success-bg)' : 
                                       log.action === 'DISPATCH' || log.action === 'DELETE' ? 'var(--danger-bg)' : 'var(--primary-50)',
                      color: log.action === 'RESTOCK' || log.action === 'ADD' ? 'var(--success)' : 
                             log.action === 'DISPATCH' || log.action === 'DELETE' ? 'var(--danger)' : 'var(--primary-600)'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td className="font-medium">{log.item}</td>
                  <td>
                    {log.qty === 0 ? '-' : log.qty > 0 ? `+${log.qty}` : log.qty}
                  </td>
                  <td className="text-muted">{log.user}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
