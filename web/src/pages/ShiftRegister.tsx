import React, { useState } from 'react';
import { Layers, DollarSign, ArrowUpRight, ArrowDownLeft, Lock, Unlock, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import { RegisterSession, UserRole } from '../types';
import { apiFetch } from '../api/client';

interface ShiftRegisterProps {
  session: RegisterSession | null;
  currencySymbol: string;
  userRole: UserRole;
  onRefresh: () => void;
}

export const ShiftRegisterPage: React.FC<ShiftRegisterProps> = ({
  session,
  currencySymbol,
  userRole,
  onRefresh,
}) => {
  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const [openingFloat, setOpeningFloat] = useState('150.00');
  const [actualCash, setActualCash] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const isOpen = session && session.status === 'OPEN';
  const expectedCash = session
    ? (session.openingFloat || 0) + (session.cashSalesAmount || 0) - (session.expenseAmount || 0)
    : 0;

  const handleOpenRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/pos/registers/open', {
        method: 'POST',
        body: JSON.stringify({
          openingFloat: Number(openingFloat),
          notes,
        }),
      });
      setMessage('Cash Register Shift Opened successfully!');
      setShowOpenModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to open register shift');
    }
  };

  const handleCloseRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/pos/registers/close', {
        method: 'POST',
        body: JSON.stringify({
          actualCash: Number(actualCash || expectedCash),
          notes,
        }),
      });
      setMessage('Shift Register closed & shift summary generated.');
      setShowCloseModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to close register shift');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Cash Register Shift Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Control cash drawer opening floats, shift sale tallies, expense subtractions, and closing reconciliation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {isOpen ? (
            <button onClick={() => setShowCloseModal(true)} className="btn btn-danger">
              <Lock size={18} /> Close Shift Drawer
            </button>
          ) : (
            <button onClick={() => setShowOpenModal(true)} className="btn btn-success">
              <Unlock size={18} /> Open Shift Register
            </button>
          )}
        </div>
      </div>

      {message && (
        <div style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {/* Shift Overview Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
        
        {/* Status Card */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>SHIFT REGISTER STATUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <span className={`badge ${isOpen ? 'badge-cashier' : 'badge-danger'}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
              {isOpen ? 'REGISTER SHIFT OPEN' : 'SHIFT CLOSED'}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 12 }}>
            Opened by: <strong>{session?.openedBy || 'Alex Rivera (Cashier)'}</strong>
          </div>
        </div>

        {/* Opening Float */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OPENING CASH FLOAT</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {currencySymbol}{(session?.openingFloat || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>Initial drawer float</div>
        </div>

        {/* Cash Sales */}
        <div className="glass-panel" style={{ padding: 22 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACCUMULATED CASH SALES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: 4 }}>
            +{currencySymbol}{(session?.cashSalesAmount || 0).toFixed(2)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>Card Sales: {currencySymbol}{(session?.cardSalesAmount || 0).toFixed(2)}</div>
        </div>

        {/* Expected Cash Drawer */}
        <div className="glass-panel" style={{ padding: 22, border: '1px solid rgba(6, 182, 212, 0.4)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--accent)' }}>EXPECTED CASH IN DRAWER</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>
            {currencySymbol}{expectedCash.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>Float + Cash Sales - Expenses</div>
        </div>

      </div>

      {/* Modal: Open Register */}
      {showOpenModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16 }}>Open Shift Cash Register</h2>
            <form onSubmit={handleOpenRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Opening Cash Float ({currencySymbol})</label>
                <input type="number" step="0.01" required className="input-field" value={openingFloat} onChange={(e) => setOpeningFloat(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Shift Notes</label>
                <input type="text" placeholder="e.g. Morning Shift Float count verified" className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowOpenModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-success">Open Shift Drawer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Close Register */}
      {showCloseModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16 }}>Close Shift Cash Register</h2>
            <div style={{ padding: 14, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, marginBottom: 14, fontSize: '0.9rem' }}>
              <div>Expected Cash Balance: <strong>{currencySymbol}{expectedCash.toFixed(2)}</strong></div>
            </div>
            <form onSubmit={handleCloseRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Actual Counted Cash in Drawer ({currencySymbol})</label>
                <input type="number" step="0.01" required placeholder={expectedCash.toFixed(2)} className="input-field" value={actualCash} onChange={(e) => setActualCash(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Discrepancy / Closing Notes</label>
                <input type="text" placeholder="Shift end count matched" className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCloseModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-danger">Confirm & Close Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
