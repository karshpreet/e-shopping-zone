import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, Server, Database, Layers, Sparkles, Package } from 'lucide-react';
import { productApi, categoryApi } from '../api/services';
import { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    productApi.getAll().then(res => {
      setFeaturedProducts(res.data.data?.slice(0, 8) || []);
    }).catch(console.error);

    categoryApi.getAll().then(res => {
      setCategories(res.data.data || []);
    }).catch(console.error);
  }, []);

  const formatPrice = (price: number) => `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '24px', padding: '3.5rem 2.5rem', color: 'white', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ maxWidth: '680px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.85rem', color: '#93c5fd', fontWeight: 600, marginBottom: '1.25rem' }}>
            <Sparkles size={16} /> Enterprise Microservices Architecture (Java 8 + React)
          </div>

          <h1 style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            Smart Shopping, <br />
            <span style={{ color: '#60a5fa' }}>Seamless Microservices.</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '2rem' }}>
            Experience an e-commerce platform built with Eureka Service Discovery, Spring Cloud API Gateway,
            JWT role-based security, instant digital wallet, and multi-service checkout choreography.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
              Explore Products <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.5rem', fontSize: '1rem', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
              Sign In (Demo Accounts)
            </Link>
          </div>
        </div>

        {/* Decorative backdrop pill */}
        <div style={{ position: 'absolute', right: '-80px', top: '-80px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(0,0,0,0) 70%)', pointerEvents: 'none' }} />
      </section>

      {/* Feature Badges */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Zap size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>Instant Digital Wallet</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>₹5,000 demo balance pre-credited</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <Server size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>Eureka Discovery</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Dynamic multi-service registry</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>Isolated Databases</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Dedicated MySQL database per service</div>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>Role-Based Auth</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Customer & Merchant portals</div>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Shop by Category</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Browse our curated collections</p>
          </div>
          <Link to="/products" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {categories.map(c => (
            <Link
              key={c.id}
              to={`/products?category=${c.id}`}
              style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem 1rem',
                textAlign: 'center',
                transition: 'all 0.2s',
                display: 'block',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#2563eb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Layers size={20} />
              </div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{c.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{c.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section style={{ marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Featured Products</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Top picks from our verified merchants</p>
          </div>
          <Link to="/products" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
            Explore All 20 Products
          </Link>
        </div>

        <div className="product-grid">
          {featuredProducts.map(p => (
            <div key={p.id} className="product-card card">
              <Link to={`/products/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ height: '200px', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/300x200/e2e8f0/94a3b8?text=${encodeURIComponent(p.name.substring(0, 15))}`; }} />
                  ) : (
                    <Package size={56} color="#cbd5e1" />
                  )}
                </div>
                {p.categoryName && (
                  <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#2563eb', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
                    {p.categoryName}
                  </span>
                )}
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: '0.5rem 0 0.25rem', lineHeight: 1.3 }}>{p.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </p>
              </Link>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{formatPrice(p.price)}</div>
                  <div style={{ fontSize: '0.75rem', color: p.stockQuantity > 0 ? '#10b981' : '#ef4444' }}>
                    {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : 'Out of stock'}
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!isAuthenticated) { navigate('/login'); return; }
                    await addToCart(p.id, 1, p.name, p.price, p.imageUrl);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
                >
                  <ShoppingBag size={14} /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
