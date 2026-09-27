import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  User,
  Wallet,
  PackageCheck,
  Layers,
  LogOut,
  Store,
  Shield,
  LayoutDashboard,
  Box,
  Truck
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';

import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrdersPage from './pages/OrdersPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import MerchantDashboardPage from './pages/MerchantDashboardPage';
import MerchantProductsPage from './pages/MerchantProductsPage';
import MerchantOrdersPage from './pages/MerchantOrdersPage';

function NavigationBar() {
  const { user, isAuthenticated, isMerchant, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <ShoppingBag size={28} />
          <span>E-Shopping Zone</span>
        </Link>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="nav-search">
          <Search className="nav-search-icon" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search electronics, books, apparel, kitchen..."
          />
        </form>

        {/* Navigation Action Links */}
        <div className="nav-actions">
          <Link to="/products" className="btn btn-outline" style={{ border: 'none' }}>
            <Layers size={18} /> Catalog
          </Link>

          {isMerchant ? (
            /* Merchant Links */
            <>
              <Link to="/merchant/dashboard" className="btn btn-outline" style={{ border: 'none', color: '#2563eb' }}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/merchant/products" className="btn btn-outline" style={{ border: 'none' }}>
                <Box size={18} /> Products
              </Link>
              <Link to="/merchant/orders" className="btn btn-outline" style={{ border: 'none' }}>
                <Truck size={18} /> Orders
              </Link>
            </>
          ) : (
            /* Customer Links */
            <>
              <Link to="/wallet" className="btn btn-outline" style={{ border: 'none' }}>
                <Wallet size={18} /> Wallet
              </Link>
              <Link to="/orders" className="btn btn-outline" style={{ border: 'none' }}>
                <PackageCheck size={18} /> Orders
              </Link>
              <Link to="/cart" className="btn btn-outline" style={{ position: 'relative' }}>
                <ShoppingBag size={18} />
                <span>Cart</span>
                {cartCount > 0 && (
                  <span
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '12px',
                      padding: '0.1rem 0.45rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      marginLeft: '0.25rem',
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* User Profile or Login */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                to="/profile"
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <User size={16} />
                <span>{user?.username}</span>
                <span className="badge badge-blue" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>
                  {user?.role}
                </span>
              </Link>
              <button
                onClick={logout}
                className="btn btn-outline"
                style={{ padding: '0.5rem', color: '#dc2626', borderColor: '#fecaca' }}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary">
              <User size={18} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <NavigationBar />

          {/* Main Routing Area */}
          <main style={{ flex: 1, padding: '2rem 0' }}>
            <div className="container">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<LoginPage />} />
                <Route path="/merchant/dashboard" element={<MerchantDashboardPage />} />
                <Route path="/merchant/products" element={<MerchantProductsPage />} />
                <Route path="/merchant/orders" element={<MerchantOrdersPage />} />
              </Routes>
            </div>
          </main>

          {/* Footer */}
          <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2.5rem 0', marginTop: 'auto' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShoppingBag size={20} color="#3b82f6" /> E-Shopping Zone
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', color: '#94a3b8' }}>
                  Enterprise E-Commerce Microservices &bull; Java 8 &bull; Spring Boot 2.7.18 &bull; Eureka Discovery &bull; API Gateway &bull; React TypeScript
                </p>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Academic / Portfolio Architecture Edition &bull; MySQL 8.x Isolated Schemas
              </div>
            </div>
          </footer>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
