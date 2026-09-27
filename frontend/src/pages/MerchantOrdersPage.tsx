import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { orderApi } from '../api/services';
import { Order } from '../types';
import { useAuth } from '../context/AuthContext';

export default function MerchantOrdersPage() {
  const { user, isMerchant, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!isMerchant) { navigate('/products'); return; }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const resp = await orderApi.getMerchantOrders();
      setOrders(resp.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await orderApi.updateStatus(orderId, newStatus);
      setToast(`Order #${orderId} marked as ${newStatus}!`);
      setTimeout(() => setToast(''), 3000);
      loadOrders();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(o => o.orderStatus === filterStatus);

  const formatPrice = (price: number) => `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '80px', right: '1.5rem', background: '#10b981', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 500 }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/merchant/dashboard" style={{ color: '#64748b' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
            Customer Orders Management
          </h1>
        </div>
        <button onClick={loadOrders} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {['ALL', 'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: 'none',
              background: filterStatus === st ? '#2563eb' : '#f1f5f9',
              color: filterStatus === st ? 'white' : '#64748b',
              cursor: 'pointer',
            }}
          >
            {st} ({st === 'ALL' ? orders.length : orders.filter(o => o.orderStatus === st).length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '4rem 1rem', textAlign: 'center', color: '#94a3b8' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
          <p>No orders found matching status "{filterStatus}".</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredOrders.map(order => (
            <div
              key={order.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
            >
              {/* Top Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#2563eb', fontFamily: 'monospace' }}>
                      #{order.orderNumber}
                    </span>
                    <span className={`badge ${order.orderStatus === 'DELIVERED' ? 'badge-green' : order.orderStatus === 'CANCELLED' ? 'badge-red' : 'badge-amber'}`}>
                      {order.orderStatus}
                    </span>
                    <span className="badge badge-blue">
                      {order.paymentMethod} &bull; {order.paymentStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Customer: <strong>{order.customerName}</strong> ({order.customerEmail}) &bull; Phone: {order.contactPhone}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    {formatPrice(order.totalAmount)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#334155' }}>
                    <span>{item.quantity}× {item.productName}</span>
                    <span style={{ fontWeight: 600 }}>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div style={{ fontSize: '0.85rem', color: '#64748b', background: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong>Deliver To:</strong> {order.shippingAddress}
              </div>

              {/* Status Update Quick Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Fulfillment Action:</span>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {order.orderStatus === 'PLACED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PROCESSING')}
                      disabled={updatingId === order.id}
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', color: '#d97706', borderColor: '#fde68a' }}
                    >
                      Mark as Processing
                    </button>
                  )}

                  {(order.orderStatus === 'PLACED' || order.orderStatus === 'PROCESSING') && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'SHIPPED')}
                      disabled={updatingId === order.id}
                      className="btn btn-outline"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', color: '#2563eb', borderColor: '#bfdbfe' }}
                    >
                      <Truck size={14} /> Mark as Shipped
                    </button>
                  )}

                  {order.orderStatus === 'SHIPPED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                      disabled={updatingId === order.id}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
                    >
                      <CheckCircle size={14} /> Mark Delivered
                    </button>
                  )}

                  {order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                      disabled={updatingId === order.id}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', color: '#dc2626' }}
                    >
                      Cancel Order
                    </button>
                  )}

                  {order.orderStatus === 'DELIVERED' && (
                    <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle size={16} /> Fully Delivered & Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
