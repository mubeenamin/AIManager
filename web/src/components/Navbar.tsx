import React from 'react';
import { Store, ShoppingCart, Package, Building2, Bot, ShieldCheck, UserCheck, Layers, ChevronDown } from 'lucide-react';
import { Business, UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  businesses: Business[];
  activeBusiness: Business;
  setActiveBusiness: (b: Business) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  businesses,
  activeBusiness,
  setActiveBusiness,
  userRole,
  setUserRole,
}) => {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'OWNER': return 'badge-owner';
      case 'SUPERVISOR': return 'badge-supervisor';
      case 'CASHIER': return 'badge-cashier';
      case 'INVENTORY_MANAGER': return 'badge-inventory';
      case 'ACCOUNTANT': return 'badge-accountant';
      default: return 'badge-supervisor';
    }
  };

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '14px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        
        {/* Brand Logo & Multi-Company Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(6, 182, 212, 0.4)'
            }}>
              <Store size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit', background: 'linear-gradient(90deg, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AI Business POS
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>Multi-Tenant SaaS Portal</div>
            </div>
          </div>

          {/* Business Selector */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Building2 size={16} color="var(--accent)" style={{ position: 'absolute', left: 12 }} />
            <select
              value={activeBusiness?.id}
              onChange={(e) => {
                const found = businesses.find((b) => b.id === e.target.value);
                if (found) setActiveBusiness(found);
              }}
              className="input-field select-field"
              style={{ paddingLeft: 36, width: 220, fontSize: '0.85rem', fontWeight: 600, background: 'rgba(19, 27, 46, 0.9)' }}
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  🏢 {b.name} ({b.businessType})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setActiveTab('pos')}
            className={`btn ${activeTab === 'pos' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShoppingCart size={18} />
            POS Terminal
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`btn ${activeTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Package size={18} />
            Inventory & Stock
          </button>

          <button
            onClick={() => setActiveTab('shift')}
            className={`btn ${activeTab === 'shift' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Layers size={18} />
            Shift Register
          </button>

          <button
            onClick={() => setActiveTab('company')}
            className={`btn ${activeTab === 'company' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Building2 size={18} />
            Company & Users
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`btn ${activeTab === 'ai' ? 'btn-accent' : 'btn-secondary'}`}
          >
            <Bot size={18} />
            AI Assistant
          </button>
        </nav>

        {/* Active Domain Role Switcher / Profile Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active User Domain</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 2 }}>
              <span className={`badge ${getRoleBadge(userRole)}`}>
                <ShieldCheck size={12} /> {userRole}
              </span>
            </div>
          </div>

          {/* Quick Domain Role Override Toggle */}
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as UserRole)}
            className="input-field select-field"
            style={{ width: 140, fontSize: '0.8rem', padding: '6px 28px 6px 10px', background: 'rgba(30, 41, 59, 0.8)' }}
            title="Switch Domain Role View"
          >
            <option value="SUPERVISOR">Supervisor</option>
            <option value="CASHIER">Cashier</option>
            <option value="OWNER">Company Owner</option>
            <option value="INVENTORY_MANAGER">Inventory Mgr</option>
            <option value="ACCOUNTANT">Accountant</option>
          </select>
        </div>

      </div>
    </header>
  );
};
