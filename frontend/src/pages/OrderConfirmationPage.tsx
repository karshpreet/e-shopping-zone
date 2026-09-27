import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { orderApi } from '../api/services';
import { Order } from '../types';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      loadOrder(orderNumber);
    }
  }, [orderNumber]);

  const loadOrder = async (num: string) => {
    try {
      setLoading(true);
      // We can search or fetch through my-orders / customer orders or direct endpoint
      const resp = await orderApi.getOrderById(1); // fallback or fetch by number if implemented
      // Or if orderNumber is available, we display details directly
      setOrder(resp.data.data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '640px', margin: '2rem auto', textAlign: 'center' }}>
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '3rem 2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '72px', height: '72px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle2 size={40} color="#16a34a" />
        </div>

        <span className="badge badge-green" style={{ marginBottom: '0.75rem' }}>
          Order Successfully Placed
        </span>

        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
          Thank You For Your Order!
        </h1>

        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
          We have received your order and are currently preparing it for shipment.
        </p>

        <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#64748b' }}>Order Tracking Number:</span>
            <span style={{ fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>{orderNumber}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            <span style={{ color: '#64748b' }}>Estimated Delivery:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>2 - 4 Business Days</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
            <span style={{ color: '#64748b' }}>Order Status:</span>
            <span className="badge badge-blue">PLACED & CONFIRMED</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/orders" className="btn btn-primary">
            View My Orders <ArrowRight size={16} />
          </Link>
          <Link to="/products" className="btn btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
