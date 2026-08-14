import React, { useState } from 'react';
import { Building2, Users, MapPin, Plus, ShieldCheck, Mail, Phone, Lock, CheckCircle2, UserPlus } from 'lucide-react';
import { Business, DomainUserMember, UserRole } from '../types';
import { apiFetch } from '../api/client';

interface CompanyProfileProps {
  business: Business;
  members: DomainUserMember[];
  onRefresh: () => void;
  currentUserRole: UserRole;
}

export const CompanyProfilePage: React.FC<CompanyProfileProps> = ({
  business,
  members,
  onRefresh,
  currentUserRole,
}) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showRegisterCompanyModal, setShowRegisterCompanyModal] = useState(false);

  // New Domain User Form state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('CASHIER');
  const [userPassword, setUserPassword] = useState('password123');

  // New Company Form state
  const [newCompName, setNewCompName] = useState('');
  const [newCompType, setNewCompType] = useState<any>('GROCERY');
  const [newCompCurrency, setNewCompCurrency] = useState('$');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/companies/users', {
        method: 'POST',
        body: JSON.stringify({
          businessId: business.id,
          name: userName,
          email: userEmail,
          password: userPassword,
          role: userRole,
        }),
      });
      setMessage({ text: `Domain user ${userName} assigned as ${userRole} successfully!`, type: 'success' });
      setShowAddUserModal(false);
      setUserName('');
      setUserEmail('');
      onRefresh();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to add user', type: 'error' });
    }
  };

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/auth/register-company', {
        method: 'POST',
        body: JSON.stringify({
          companyName: newCompName,
          businessType: newCompType,
          currencySymbol: newCompCurrency,
          ownerName,
          ownerEmail,
          ownerPassword: 'password123',
        }),
      });
      setMessage({ text: `Company profile "${newCompName}" created!`, type: 'success' });
      setShowRegisterCompanyModal(false);
      onRefresh();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to register company', type: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Company Profile & Domain Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Manage multi-tenant business settings, branch locations, and staff user domains (Cashier, Supervisor, etc.)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setShowRegisterCompanyModal(true)} className="btn btn-secondary">
            <Plus size={18} /> Register New Company
          </button>
          <button onClick={() => setShowAddUserModal(true)} className="btn btn-primary">
            <UserPlus size={18} /> Add Domain User
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 12,
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: message.type === 'success' ? '#34d399' : '#f87171',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <CheckCircle2 size={18} /> {message.text}
        </div>
      )}

      {/* Main Info Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        
        {/* Active Company Details */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <div style={{ padding: 10, background: 'rgba(59, 130, 246, 0.15)', borderRadius: 12, color: '#60a5fa' }}>
              <Building2 size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{business.name}</h3>
              <span className="badge badge-owner" style={{ marginTop: 4 }}>{business.businessType}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
              <span>Legal Registered Name:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{business.legalName || business.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
              <span>Tax / VAT Number:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{business.taxNumber || 'TAX-889102'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
              <span>Primary Currency:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{business.currency} ({business.currencySymbol})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
              <span>Support Phone:</span>
              <strong style={{ color: 'var(--text-primary)' }}>{business.phone || '+1 800-555-APEX'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Primary Address:</span>
              <strong style={{ color: 'var(--text-primary)', textAlign: 'right' }}>{business.address || 'Metro Plaza, NY'}</strong>
            </div>
          </div>
        </div>

        {/* Branches list */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MapPin size={22} color="var(--accent)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Company Branches</h3>
            </div>
            <span className="badge badge-supervisor">{business.branches?.length || 1} Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {business.branches?.map((br) => (
              <div key={br.id} className="glass-card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{br.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Code: {br.code} • {br.address}</div>
                </div>
                <span className="badge badge-cashier">Primary</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Domain Users List Table */}
      <div className="glass-panel" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Domain User Accounts & Permissions</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Domain roles govern feature permissions across POS, Shift Register, Stock Audit, and Financials.
            </p>
          </div>
          <button onClick={() => setShowAddUserModal(true)} className="btn btn-primary btn-sm">
            <UserPlus size={16} /> Invite User
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <th style={{ padding: '12px 16px' }}>NAME</th>
                <th style={{ padding: '12px 16px' }}>EMAIL & CONTACT</th>
                <th style={{ padding: '12px 16px' }}>DOMAIN ROLE</th>
                <th style={{ padding: '12px 16px' }}>ALLOWED POS PERMISSIONS</th>
                <th style={{ padding: '12px 16px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const isCashier = m.role === 'CASHIER';
                const isSupervisor = m.role === 'SUPERVISOR';
                const isOwner = m.role === 'OWNER';
                return (
                  <tr key={m.membership_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontWeight: 700 }}>
                          {m.name.charAt(0)}
                        </div>
                        {m.name}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{m.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${
                        isOwner ? 'badge-owner' : isSupervisor ? 'badge-supervisor' : isCashier ? 'badge-cashier' : 'badge-inventory'
                      }`}>
                        <ShieldCheck size={12} /> {m.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {isCashier && '• Checkout POS • Shift Register'}
                      {isSupervisor && '• POS • Shift Register • Price Overrides • Stock Audits'}
                      {isOwner && '• Full Enterprise Access • Financial Reports'}
                      {m.role === 'INVENTORY_MANAGER' && '• Stock Audit Ledger • Products Catalog'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-cashier">ACTIVE</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Domain User */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Add Domain Staff User</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Assign a role domain (Cashier, Supervisor, etc.) for this company workspace.
            </p>

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Rivera"
                  className="input-field"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="cashier@apex.com"
                  className="input-field"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Domain Role</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="input-field select-field"
                >
                  <option value="CASHIER">CASHIER (POS & Shift Register)</option>
                  <option value="SUPERVISOR">SUPERVISOR (POS, Overrides & Stock)</option>
                  <option value="INVENTORY_MANAGER">INVENTORY MANAGER (Stock Ledger & Purchasing)</option>
                  <option value="ACCOUNTANT">ACCOUNTANT (Expenses & Financial Reports)</option>
                  <option value="OWNER">OWNER (Full Company Admin)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Initial Password</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddUserModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Domain User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register New Company Profile */}
      {showRegisterCompanyModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Register New Company Profile</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Create a multi-tenant business workspace with initial branch and owner account.
            </p>

            <form onSubmit={handleRegisterCompany} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Supermarket"
                  className="input-field"
                  value={newCompName}
                  onChange={(e) => setNewCompName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Business Domain</label>
                  <select
                    value={newCompType}
                    onChange={(e) => setNewCompType(e.target.value)}
                    className="input-field select-field"
                  >
                    <option value="GROCERY">Grocery</option>
                    <option value="ELECTRONICS">Electronics</option>
                    <option value="RETAIL">Retail</option>
                    <option value="PHARMACY">Pharmacy</option>
                    <option value="CLOTHING">Clothing</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Currency Symbol</label>
                  <input
                    type="text"
                    required
                    placeholder="$"
                    className="input-field"
                    value={newCompCurrency}
                    onChange={(e) => setNewCompCurrency(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Owner Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Apex"
                  className="input-field"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Owner Email</label>
                <input
                  type="email"
                  required
                  placeholder="owner@apex.com"
                  className="input-field"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowRegisterCompanyModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Company Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
