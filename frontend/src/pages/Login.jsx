import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, ShieldCheck, User } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import './Login.css';

export const Login = () => {
  const { setUserRole } = useAppContext();
  const navigate = useNavigate();
  const [role, setRole] = useState('Admin');

  const handleLogin = (e) => {
    e.preventDefault();
    setUserRole(role);
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-container glass-panel animate-fade-in">
        <div className="login-header">
          <PackagePlus className="logo-icon center-icon" size={48} />
          <h2>Welcome to StockFlow</h2>
          <p className="text-muted">Sign in to manage warehouse operations</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="role-selector">
            <div 
              className={`role-card ${role === 'Admin' ? 'active' : ''}`}
              onClick={() => setRole('Admin')}
            >
              <ShieldCheck size={28} className="role-icon" />
              <span>Admin Access</span>
            </div>
            <div 
              className={`role-card ${role === 'Staff' ? 'active' : ''}`}
              onClick={() => setRole('Staff')}
            >
              <User size={28} className="role-icon" />
              <span>Staff Access</span>
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '1.5rem', width: '100%' }}>
            <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Email Address (Demo)</label>
            <input type="email" value={role === 'Admin' ? 'admin@stockflow.dev' : 'staff@stockflow.dev'} readOnly className="input-field" />
          </div>

          <button type="submit" className="btn-primary login-btn">
            Sign In as {role}
          </button>
        </form>
      </div>
    </div>
  );
};
