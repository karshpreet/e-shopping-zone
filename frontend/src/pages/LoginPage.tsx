import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, EyeOff, User, Mail, Lock, AlertCircle } from 'lucide-react';
import { authApi } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    username: '',
    email: '',
    fullName: '',
    role: 'CUSTOMER' as 'CUSTOMER' | 'MERCHANT',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const resp = await authApi.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          fullName: formData.fullName,
        });
        const data = resp.data.data;
        login({ ...data, fullName: formData.fullName });
        navigate(data.role === 'MERCHANT' ? '/merchant/dashboard' : '/products');
      } else {
        const resp = await authApi.login({
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password,
        });
        const data = resp.data.data;
        login({ ...data });
        navigate(data.role === 'MERCHANT' ? '/merchant/dashboard' : '/products');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Authentication failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShoppingBag size={32} color="#3b82f6" />
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>E-Shopping Zone</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {isRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Demo Credentials */}
        {!isRegister && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem' }}>Demo Credentials:</div>
            <div style={{ color: '#1e40af' }}>
              <div>👤 Customer: <strong>customer@eshop.com</strong> / <strong>password123</strong></div>
              <div style={{ marginTop: '0.25rem' }}>🏪 Merchant: <strong>merchant@eshop.com</strong> / <strong>password123</strong></div>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: '2rem' }}>
          {/* Tab Switch */}
          <div style={{ display: 'flex', marginBottom: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
            <button
              onClick={() => { setIsRegister(false); setError(''); }}
              style={{
                flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer',
                background: !isRegister ? '#3b82f6' : 'white',
                color: !isRegister ? 'white' : '#64748b',
                fontWeight: 600, fontSize: '0.9rem',
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(''); }}
              style={{
                flex: 1, padding: '0.6rem', border: 'none', cursor: 'pointer',
                background: isRegister ? '#3b82f6' : 'white',
                color: isRegister ? 'white' : '#64748b',
                fontWeight: 600, fontSize: '0.9rem',
              }}
            >
              Register
            </button>
          </div>

          {error && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isRegister && (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      type="text" required
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="Your full name"
                      style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Username</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      type="text" required
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Username"
                      style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      type="email" required
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Account Type</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', background: 'white' }}
                  >
                    <option value="CUSTOMER">Customer - Shop & Buy</option>
                    <option value="MERCHANT">Merchant - Sell Products</option>
                  </select>
                </div>
              </>
            )}

            {!isRegister && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Email or Username</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                  <input
                    type="text" required
                    value={formData.usernameOrEmail}
                    onChange={e => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                    placeholder="customer@eshop.com"
                    style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                <input
                  type={showPass ? 'text' : 'password'} required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="password123"
                  minLength={6}
                  style={{ width: '100%', padding: '0.6rem 2.5rem 0.6rem 2.25rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
