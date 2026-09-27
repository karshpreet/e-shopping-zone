import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag, Truck } from 'lucide-react';
import { orderApi } from '../api/services';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const resp = await orderApi.getMyOrders(user.userId);
      setOrders(resp.data.data || []);
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PLACED':
        return <span className="badge badge-blue">Order Placed</span>;
      case 'PROCESSING':
        return <span className="badge badge-amber">Processing</span>;
      case 'SHIPPED':
        return <span className="badge badge-blue" style={{ background: '#e0e7ff', color: '#4338ca' }}>Shipped</span>;
      case 'DELIVERED':
        return <span className="badge badge-green">Delivered</span>;
      case 'CANCELLED':
        return <span className="badge badge-red">Cancelled</span>;
      default:
        return <span className="badge badge-blue">{status}</span>;
    }
  };

  const formatPrice = (price: number) => `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
        <Package size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
        <p>Loading your order history...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          My Orders & History
        </h1>
        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Package size={56} style={{ color: '#94a3b8', margin: '0 auto 1rem', display: 'block' }} />
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a' }}>No Orders Found</h2>
          <p style={{ color: '#64748b', margin: '0.5rem 0 1.5rem' }}>You haven't placed any orders yet. Start exploring our store!</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map(order => (
            <div
              key={order.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              {/* Top Bar: Order Info & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>
                      Order #{order.orderNumber}
                    </span>
                    {getStatusBadge(order.orderStatus)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Placed on: {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb' }}>
                    {formatPrice(order.totalAmount)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Payment: <span style={{ fontWeight: 600, color: '#0f172a' }}>{order.paymentMethod}</span> ({order.paymentStatus})
                  </div>
                </div>
              </div>

              {/* Items in this order */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '6px', background: '#f8fafc', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/80x80/e2e8f0/94a3b8?text=Product`; }} />
                      ) : (
                        <Package size={24} color="#94a3b8" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>{item.productName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Qty: {item.quantity} × {formatPrice(item.unitPrice)}</div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a' }}>
                      {formatPrice(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer: Shipping details and Wallet TXN */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b' }}>
                <div>
                  <strong>Ship to:</strong> {order.shippingAddress} (Phone: {order.contactPhone})
                </div>
                {order.walletTransactionId && (
                  <div>
                    <strong>Wallet Ref:</strong> <span style={{ fontFamily: 'monospace', color: '#2563eb' }}>{order.walletTransactionId}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
