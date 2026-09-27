import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <ShoppingBag size={56} style={{ color: '#94a3b8', margin: '0 auto 1rem', display: 'block' }} />
        <h2>Your Cart is Waiting</h2>
        <p style={{ color: '#64748b', margin: '0.75rem 0 1.5rem' }}>Please log in to view and manage items in your shopping cart.</p>
        <Link to="/login" className="btn btn-primary">Sign In to View Cart</Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const itemCount = cart?.itemCount || 0;

  const formatPrice = (price: number) => `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <ShoppingBag size={56} style={{ color: '#94a3b8', margin: '0 auto 1rem', display: 'block' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Your Shopping Cart is Empty</h2>
        <p style={{ color: '#64748b', margin: '0.75rem 0 1.5rem' }}>Explore our catalog to find great electronics, books, apparel, and more.</p>
        <Link to="/products" className="btn btn-primary">Explore Products</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          Shopping Cart ({itemCount} item{itemCount !== 1 ? 's' : ''})
        </h1>
        <button
          onClick={() => clearCart()}
          style={{ color: '#ef4444', fontSize: '0.875rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <Trash2 size={16} /> Clear Cart
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        {/* Items List */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.25rem',
                borderBottom: idx !== items.length - 1 ? '1px solid #f1f5f9' : 'none',
              }}
            >
              {/* Product Image */}
              <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: '#f8fafc', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://placehold.co/100x100/e2e8f0/94a3b8?text=Item`;
                    }}
                  />
                ) : (
                  <ShoppingBag size={32} color="#94a3b8" />
                )}
              </div>

              {/* Title & Unit Price */}
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.productId}`} style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem', display: 'block', marginBottom: '0.25rem' }}>
                  {item.productName}
                </Link>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Unit Price: {formatPrice(item.unitPrice)}
                </div>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                <button
                  onClick={() => {
                    if (item.quantity > 1) {
                      updateQuantity(item.productId, item.quantity - 1);
                    } else {
                      removeItem(item.productId);
                    }
                  }}
                  style={{ width: '30px', height: '30px', background: '#f8fafc', fontWeight: 700 }}
                >
                  -
                </button>
                <span style={{ width: '36px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  style={{ width: '30px', height: '30px', background: '#f8fafc', fontWeight: 700 }}
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <div style={{ width: '110px', textAlign: 'right', fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                {formatPrice(item.subtotal)}
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(item.productId)}
                style={{ color: '#94a3b8', padding: '0.4rem', borderRadius: '4px' }}
                title="Remove item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', position: 'sticky', top: '90px' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>Order Summary</h2>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
            <span>Subtotal ({itemCount} items)</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatPrice(totalAmount)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.75rem' }}>
            <span>Standard Shipping</span>
            <span style={{ fontWeight: 600, color: '#10b981' }}>FREE</span>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', margin: '1rem 0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Total Amount</span>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb' }}>{formatPrice(totalAmount)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <Link
            to="/products"
            style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
