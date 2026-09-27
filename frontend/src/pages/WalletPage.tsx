import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, PlusCircle, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { walletApi } from '../api/services';
import { Wallet, WalletTransaction } from '../types';
import { useAuth } from '../context/AuthContext';

export default function WalletPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [topupAmount, setTopupAmount] = useState('1000');
  const [loading, setLoading] = useState(true);
  const [toppingUp, setToppingUp] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }
    loadWalletData();
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [wResp, tResp] = await Promise.all([
        walletApi.getWallet(user.userId),
        walletApi.getTransactions(user.userId),
      ]);
      setWallet(wResp.data.data);
      setTransactions(tResp.data.data || []);
    } catch (e) {
      console.error('Error loading wallet', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amountNum = parseFloat(topupAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setToppingUp(true);
    setError('');
    try {
      const resp = await walletApi.topup(user.userId, {
        amount: amountNum,
        description: `Added ₹${amountNum.toFixed(2)} to wallet`,
      });
      setToast(`Successfully topped up ₹${amountNum.toFixed(2)}!`);
      setTimeout(() => setToast(''), 4000);
      setTopupAmount('1000');
      // Reload wallet & transactions
      await loadWalletData();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to top up wallet');
    } finally {
      setToppingUp(false);
    }
  };

  const formatPrice = (price: number) => `₹${Number(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '80px', right: '1.5rem', background: '#10b981', color: 'white', padding: '0.75rem 1.25rem', borderRadius: '8px', zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 500 }}>
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>
          My Digital Wallet
        </h1>
        <button
          onClick={loadWalletData}
          disabled={loading}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Balance
        </button>
      </div>

      {/* Top Section: Balance Card & Topup Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Balance Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            borderRadius: '16px',
            padding: '2rem',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
            minHeight: '200px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', opacity: 0.85, fontWeight: 500, letterSpacing: '0.05em' }}>
              E-SHOPPING WALLET
            </span>
            <WalletIcon size={28} style={{ opacity: 0.9 }} />
          </div>

          <div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.35rem' }}>Available Balance</div>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {wallet ? formatPrice(wallet.balance) : '₹0.00'}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.75, paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <span>Account: #{user?.userId} ({user?.username})</span>
            <span>Status: ACTIVE</span>
          </div>
        </div>

        {/* Top-up Form Card */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PlusCircle size={20} color="#2563eb" /> Instant Wallet Top-Up
          </h2>

          {error && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.6rem 0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleTopup}>
            {/* Quick Amount Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {['500', '1000', '2000', '5000'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTopupAmount(val)}
                  style={{
                    flex: 1,
                    padding: '0.5rem 0',
                    borderRadius: '8px',
                    border: `1px solid ${topupAmount === val ? '#2563eb' : '#cbd5e1'}`,
                    background: topupAmount === val ? '#eff6ff' : 'white',
                    color: topupAmount === val ? '#2563eb' : '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                  }}
                >
                  ₹{val}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>Custom Amount (₹)</label>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={topupAmount}
                onChange={e => setTopupAmount(e.target.value)}
                placeholder="Enter amount"
                style={{ width: '100%', padding: '0.65rem 0.85rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', fontWeight: 600 }}
              />
            </div>

            <button
              type="submit"
              disabled={toppingUp}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
            >
              {toppingUp ? 'Processing Top-up...' : `Add ₹${topupAmount || 0} to Wallet`}
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History Table */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
          Transaction History ({transactions.length})
        </h2>

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <p>No transactions found in this wallet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Transaction ID</th>
                  <th>Reference</th>
                  <th>Description</th>
                  <th>Date & Time</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(txn => {
                  const isCredit = txn.type === 'CREDIT';
                  return (
                    <tr key={txn.id || txn.transactionId}>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: isCredit ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>
                          {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          {txn.type}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#64748b' }}>
                        {txn.transactionId}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                        {txn.referenceId || '-'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#334155', maxWidth: '240px' }}>
                        {txn.description}
                      </td>
                      <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {new Date(txn.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: isCredit ? '#16a34a' : '#dc2626', fontSize: '0.95rem' }}>
                        {isCredit ? '+' : '-'}{formatPrice(txn.amount)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${txn.status === 'SUCCESS' ? 'badge-green' : 'badge-red'}`}>
                          {txn.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
