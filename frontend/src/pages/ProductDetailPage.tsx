import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Check, Package, Shield, Truck, RefreshCw } from 'lucide-react';
import { productApi } from '../api/services';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState('');
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id));
    }
  }, [id]);

  const loadProduct = async (productId: number) => {
    try {
      setLoading(true);
      const resp = await productApi.getById(productId);
      setProduct(resp.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, quantity, product.name, product.price, product.imageUrl);
      setToast(`Added ${quantity} item(s) to your cart!`);
      setTimeout(() => setToast(''), 3000);
    } catch (e: any) {
      setToast(e?.response?.data?.message || 'Failed to add item');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0' }}>
        <Package size={48} style={{ opacity: 0.5, margin: '0 auto 1rem', display: 'block' }} />
        <p style={{ color: '#64748b' }}>Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: '#64748b', margin: '1rem 0' }}>The product you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="btn btn-primary">Return to Catalog</Link>
      </div>
    );
  }

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '80px', right: '1.5rem', background: '#10b981', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 500 }}>
          {toast}
        </div>
      )}

      <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2.5rem', background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        {/* Product Image */}
        <div style={{ height: '380px', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://placehold.co/400x400/e2e8f0/94a3b8?text=${encodeURIComponent(product.name.substring(0, 20))}`;
              }}
            />
          ) : (
            <Package size={96} color="#cbd5e1" />
          )}
        </div>

        {/* Product Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {product.categoryName && (
            <span style={{ fontSize: '0.8rem', background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.75rem', borderRadius: '12px', fontWeight: 600, alignSelf: 'flex-start', marginBottom: '0.75rem' }}>
              {product.categoryName}
            </span>
          )}

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.25 }}>
            {product.name}
          </h1>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', margin: '1rem 0' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>
              {formatPrice(product.price)}
            </span>
            <span className={`badge ${product.stockQuantity > 0 ? 'badge-green' : 'badge-red'}`}>
              {product.stockQuantity > 0 ? `In Stock (${product.stockQuantity})` : 'Out of Stock'}
            </span>
          </div>

          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {product.description}
          </p>

          {/* Quantity Selector & Add to Cart */}
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{ width: '36px', height: '36px', background: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}
                >
                  -
                </button>
                <span style={{ width: '44px', textAlign: 'center', fontWeight: 600, fontSize: '0.95rem' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity}
                  style={{ width: '36px', height: '36px', background: '#f8fafc', fontWeight: 700, fontSize: '1.1rem' }}
                >
                  +
                </button>
              </div>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Max: {product.stockQuantity}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stockQuantity === 0}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.85rem', fontSize: '1rem' }}
              >
                {adding ? 'Adding...' : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              <Link to="/cart" className="btn btn-secondary" style={{ padding: '0.85rem 1.25rem' }}>
                View Cart
              </Link>
            </div>
          </div>

          {/* Value props */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              <Truck size={20} color="#2563eb" style={{ margin: '0 auto 0.25rem', display: 'block' }} />
              Fast Delivery
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              <Shield size={20} color="#10b981" style={{ margin: '0 auto 0.25rem', display: 'block' }} />
              Secure Payment
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              <RefreshCw size={20} color="#f59e0b" style={{ margin: '0 auto 0.25rem', display: 'block' }} />
              Easy Returns
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
