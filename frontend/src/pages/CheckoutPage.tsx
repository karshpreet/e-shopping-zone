import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Wallet, Truck, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, walletApi, profileApi } from '../api/services';

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: user?.fullName || user?.username || 'Customer Demo',
    customerEmail: user?.email || 'customer@eshop.com',
    contactPhone: '+91 9876543210',
    shippingAddress: 'Flat 402, Green Glen Layout, Bellandur, Bangalore, Karnataka - 560103',
    paymentMethod: 'WALLET' as 'WALLET' | 'COD',
  });

  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = cart?.totalAmount || 0;
  const items = cart?.items || [];

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    loadWalletBalance();
    loadProfile();
  }, [user]);

  const loadWalletBalance = async () => {
    if (!user) return;
    try {
      const resp = await walletApi.getBalance(user.userId);
      setWalletBalance(resp.data.data);
    } catch (e) {
      console.error('Error loading wallet balance', e);
    }
  };

  const loadProfile = async () => {
    if (!user) return;
    try {
      const resp = await profileApi.getProfile(user.userId);
      const profile = resp.data.data;
      if (profile) {
        setFormData(prev => ({
          ...prev,
          customerName: profile.fullName || prev.customerName,
          contactPhone: profile.phoneNumber || prev.contactPhone,
          shippingAddress: profile.addressLine1
            ? `${profile.addressLine1}${profile.addressLine2 ? ', ' + profile.addressLine2 : ''}, ${profile.city}, ${profile.state} - ${profile.postalCode}`
            : prev.shippingAddress,
        }));
      }
    } catch (e) {
      // ignore
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (formData.paymentMethod === 'WALLET' && walletBalance !== null && walletBalance < totalAmount) {
      setError(`Insufficient wallet balance (Available: ₹${walletBalance.toFixed(2)}, Required: ₹${totalAmount.toFixed(2)}). Please top up your wallet or choose Cash on Delivery.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const resp = await orderApi.checkout({
        customerId: user.userId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        paymentMethod: formData.paymentMethod,
        shippingAddress: formData.shippingAddress,
        contactPhone: formData.contactPhone,
      });

      const order = resp.data.data;
      // Refresh/clear local cart context
      await clearCart();
      navigate(`/order-confirmation/${order.orderNumber}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to complete order');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>No items to checkout</h2>
        <p style={{ color: '#64748b', margin: '1rem 0' }}>Your cart is currently empty.</p>
        <Link to="/products" className="btn btn-primary">Go to Catalog</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Return to Cart
      </Link>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem' }}>
        Checkout & Payment
      </h1>

      {error && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', color: '#dc2626', fontSize: '0.9rem' }}>
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Left Column: Shipping & Payment */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Shipping Address Card */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} color="#2563eb" /> 1. Shipping Information
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Recipient Name</label>
                <input
                  type="text" required
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Contact Phone</label>
                <input
                  type="text" required
                  value={formData.contactPhone}
                  onChange={e => setFormData({ ...formData, contactPhone: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Email Address</label>
              <input
                type="email" required
                value={formData.customerEmail}
                onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Delivery Address</label>
              <textarea
                required rows={3}
                value={formData.shippingAddress}
                onChange={e => setFormData({ ...formData, shippingAddress: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Payment Method Card */}
          <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={20} color="#2563eb" /> 2. Payment Method
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Wallet Option */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  border: `2px solid ${formData.paymentMethod === 'WALLET' ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: formData.paymentMethod === 'WALLET' ? '#eff6ff' : 'white',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="WALLET"
                  checked={formData.paymentMethod === 'WALLET'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'WALLET' })}
                  style={{ marginRight: '1rem', width: '18px', height: '18px' }}
                />
                <Wallet size={24} color="#2563eb" style={{ marginRight: '0.75rem' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>E-Shopping Digital Wallet</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Instant 1-click payment with your pre-funded wallet</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                    Balance: {walletBalance !== null ? formatPrice(walletBalance) : '...'}
                  </div>
                  {walletBalance !== null && walletBalance < totalAmount && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Low Balance</span>
                  )}
                </div>
              </label>

              {/* COD Option */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  border: `2px solid ${formData.paymentMethod === 'COD' ? '#2563eb' : '#e2e8f0'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: formData.paymentMethod === 'COD' ? '#eff6ff' : 'white',
                  transition: 'all 0.2s',
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                  style={{ marginRight: '1rem', width: '18px', height: '18px' }}
                />
                <Truck size={24} color="#10b981" style={{ marginRight: '0.75rem' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>Cash on Delivery (COD)</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Pay with cash or UPI upon delivery at your doorstep</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', position: 'sticky', top: '90px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Order Review</h2>

          <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.25rem' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.productName}</div>
                  <div style={{ color: '#64748b' }}>Qty: {item.quantity} × {formatPrice(item.unitPrice)}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{formatPrice(item.subtotal)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>
              <span>Subtotal</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>
              <span>Delivery Fee</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
              <span>Total Pay</span>
              <span style={{ color: '#2563eb' }}>{formatPrice(totalAmount)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '1rem' }}
          >
            {loading ? 'Processing Order...' : `Confirm & Place Order (${formatPrice(totalAmount)})`}
          </button>
        </div>
      </form>
    </div>
  );
}
