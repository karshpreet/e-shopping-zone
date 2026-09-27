import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
import { productApi, orderApi } from '../api/services';
import { Product, Order } from '../types';
import { useAuth } from '../context/AuthContext';

export default function MerchantDashboardPage() {
  const { user, isMerchant, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isMerchant) {
      navigate('/products');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prodResp, ordResp] = await Promise.all([
        productApi.getAll(),
        orderApi.getMerchantOrders(),
      ]);
      setProducts(prodResp.data.data || []);
      setOrders(ordResp.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0);
  const lowStockProducts = products.filter(p => p.stockQuantity < 5);
  const formatPrice = (price: number) => `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom: '0.4rem' }}>Merchant Portal</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Merchant Dashboard
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/merchant/products" className="btn btn-primary">
            <Plus size={16} /> Manage Products
          </Link>
          <Link to="/merchant/orders" className="btn btn-secondary">
            <Package size={16} /> View Orders
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TOTAL PRODUCTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{products.length}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TOTAL ORDERS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{orders.length}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>TOTAL REVENUE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{formatPrice(totalRevenue)}</div>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>LOW STOCK ALERTS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{lowStockProducts.length}</div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>Recent Customer Orders</h2>
          <Link to="/merchant/orders" style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            View All ({orders.length}) <ArrowRight size={14} />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No customer orders placed yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#2563eb' }}>{o.orderNumber}</td>
                    <td>{o.customerName}</td>
                    <td style={{ fontWeight: 700 }}>{formatPrice(o.totalAmount)}</td>
                    <td><span className="badge badge-blue">{o.paymentMethod}</span></td>
                    <td>
                      <span className={`badge ${o.orderStatus === 'DELIVERED' ? 'badge-green' : o.orderStatus === 'CANCELLED' ? 'badge-red' : 'badge-amber'}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
