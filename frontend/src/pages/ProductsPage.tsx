import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Star, Package, ChevronRight } from 'lucide-react';
import { productApi, categoryApi } from '../api/services';
import { Product, Category } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const query = searchParams.get('search') || '';
    const catId = searchParams.get('category');
    setSearchQuery(query);
    if (catId) setSelectedCategory(parseInt(catId));
    loadData(query, catId ? parseInt(catId) : null);
  }, [searchParams]);

  const loadData = async (query?: string, catId?: number | null) => {
    setLoading(true);
    try {
      const [prodResp, catResp] = await Promise.all([
        query ? productApi.search(query) : catId ? productApi.getByCategory(catId) : productApi.getAll(),
        categoryApi.getAll(),
      ]);
      setProducts(prodResp.data.data || []);
      setCategories(catResp.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchQuery ? `/products?search=${encodeURIComponent(searchQuery)}` : '/products');
  };

  const handleCategoryClick = (catId: number | null) => {
    setSelectedCategory(catId);
    navigate(catId ? `/products?category=${catId}` : '/products');
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1, product.name, product.price, product.imageUrl);
      setToast(`"${product.name}" added to cart!`);
      setTimeout(() => setToast(''), 3000);
    } catch (e: any) {
      setToast(e?.response?.data?.message || 'Failed to add to cart');
      setTimeout(() => setToast(''), 3000);
    } finally {
      setAddingId(null);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '80px', right: '1.5rem', background: '#10b981', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 500 }}>
          {toast}
        </div>
      )}

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.5rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
        </div>
      </form>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' }}>
        <button
          onClick={() => handleCategoryClick(null)}
          className={`badge ${!selectedCategory ? 'badge-blue' : ''}`}
          style={{ border: !selectedCategory ? 'none' : '1px solid #d1d5db', background: !selectedCategory ? '#3b82f6' : 'white', color: !selectedCategory ? 'white' : '#374151', cursor: 'pointer', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 500 }}
        >
          All Products
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            style={{ border: selectedCategory === cat.id ? 'none' : '1px solid #d1d5db', background: selectedCategory === cat.id ? '#3b82f6' : 'white', color: selectedCategory === cat.id ? 'white' : '#374151', cursor: 'pointer', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 500 }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
          {loading ? 'Loading...' : `${products.length} product${products.length !== 1 ? 's' : ''} found`}
        </span>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
          <p>No products found.</p>
          <button onClick={() => { setSearchQuery(''); handleCategoryClick(null); }} className="btn btn-outline" style={{ marginTop: '1rem' }}>Clear Filters</button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(product => (
            <div key={product.id} className="product-card card">
              <Link to={`/products/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ height: '200px', background: '#f8fafc', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/300x200/e2e8f0/94a3b8?text=${encodeURIComponent(product.name.substring(0, 15))}`; }}
                    />
                  ) : (
                    <Package size={64} color="#cbd5e1" />
                  )}
                </div>
                {product.categoryName && (
                  <span style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 500 }}>
                    {product.categoryName}
                  </span>
                )}
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', margin: '0.5rem 0 0.25rem', lineHeight: 1.3 }}>{product.name}</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {product.description}
                </p>
              </Link>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{formatPrice(product.price)}</div>
                  <div style={{ fontSize: '0.75rem', color: product.stockQuantity > 0 ? '#10b981' : '#ef4444' }}>
                    {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
                  </div>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={addingId === product.id || product.stockQuantity === 0}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
                >
                  {addingId === product.id ? '...' : <><ShoppingCart size={14} /> Add</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
