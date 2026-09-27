import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { profileApi } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const resp = await profileApi.getProfile(user.userId);
      const p = resp.data.data;
      if (p) {
        setFormData({
          fullName: p.fullName || '',
          phoneNumber: p.phoneNumber || '',
          addressLine1: p.addressLine1 || '',
          addressLine2: p.addressLine2 || '',
          city: p.city || '',
          state: p.state || '',
          postalCode: p.postalCode || '',
          country: p.country || 'India',
        });
      }
    } catch (e) {
      console.error('Error loading profile', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      await profileApi.updateProfile(user.userId, formData);
      setToast('Profile updated successfully!');
      setTimeout(() => setToast(''), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '80px', right: '1.5rem', background: '#10b981', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 500 }}>
          {toast}
        </div>
      )}

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
        My Account & Profile
      </h1>

      {error && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '2rem' }}>
        {/* User Account Info Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem' }}>
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{user?.username}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user?.email} &bull; <span className="badge badge-blue">{user?.role}</span></div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Full Legal Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Full name"
              style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Phone Number</label>
            <input
              type="text"
              value={formData.phoneNumber}
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder="+91 9876543210"
              style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={18} color="#2563eb" /> Default Shipping Address
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Address Line 1</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={e => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="House/Flat No, Apartment, Street"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={e => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Landmark, Area"
                  style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="560001"
                    style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ padding: '0.75rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
          >
            {saving ? 'Saving changes...' : <><Save size={18} /> Update Profile</>}
          </button>
        </form>
      </div>
    </div>
  );
}
