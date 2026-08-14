import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { WebPOSPage } from './pages/WebPOS';
import { WebInventoryPage } from './pages/WebInventory';
import { ShiftRegisterPage } from './pages/ShiftRegister';
import { CompanyProfilePage } from './pages/CompanyProfile';
import { AIInsightsPage } from './pages/AIInsights';
import { Business, Category, Product, StockMovement, DomainUserMember, UserRole, RegisterSession } from './types';
import { apiFetch, setApiAuth } from './api/client';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('pos');
  const [userRole, setUserRole] = useState<UserRole>('SUPERVISOR');

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState<Business | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [members, setMembers] = useState<DomainUserMember[]>([]);
  const [registerSession, setRegisterSession] = useState<RegisterSession | null>(null);

  // Load Companies & Active Data
  const loadData = async () => {
    try {
      // 1. Fetch Companies
      const fetchedBiz = await apiFetch<Business[]>('/companies');
      if (fetchedBiz && fetchedBiz.length > 0) {
        setBusinesses(fetchedBiz);
        const currentBiz = activeBusiness ? fetchedBiz.find((b) => b.id === activeBusiness.id) || fetchedBiz[0] : fetchedBiz[0];
        setActiveBusiness(currentBiz);
        setApiAuth(null, currentBiz.id, userRole);

        // 2. Fetch Products
        const fetchedProds = await apiFetch<Product[]>(`/products?businessId=${currentBiz.id}`);
        setProducts(fetchedProds);

        // 3. Fetch Categories
        const fetchedCats = await apiFetch<Category[]>(`/products/categories?businessId=${currentBiz.id}`);
        setCategories(fetchedCats);

        // 4. Fetch Stock Movements
        const fetchedMovs = await apiFetch<StockMovement[]>(`/inventory/movements?businessId=${currentBiz.id}`);
        setMovements(fetchedMovs);

        // 5. Fetch Company Details & Domain Members
        const compDetail = await apiFetch<any>(`/companies/${currentBiz.id}`);
        if (compDetail && compDetail.members) {
          setMembers(compDetail.members);
        }

        // 6. Fetch Shift Register Status
        const regRes = await apiFetch<{ status: string; session: RegisterSession | null }>(`/pos/registers/session?businessId=${currentBiz.id}`);
        setRegisterSession(regRes.session);
      }
    } catch (err) {
      console.warn('Backend server connecting... Retrying in background:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [userRole]);

  useEffect(() => {
    if (activeBusiness) {
      setApiAuth(null, activeBusiness.id, userRole);
      loadData();
    }
  }, [activeBusiness?.id]);

  if (!activeBusiness) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Loading AI Business Manager...</div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Initializing backend API connection & company context...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        businesses={businesses}
        activeBusiness={activeBusiness}
        setActiveBusiness={(b) => {
          setActiveBusiness(b);
          setApiAuth(null, b.id, userRole);
        }}
        userRole={userRole}
        setUserRole={(r) => {
          setUserRole(r);
          setApiAuth(null, activeBusiness.id, r);
        }}
      />

      <main className="main-content">
        {activeTab === 'pos' && (
          <WebPOSPage
            products={products}
            categories={categories}
            currencySymbol={activeBusiness.currencySymbol || '$'}
            userRole={userRole}
            registerSession={registerSession}
            onSaleComplete={loadData}
          />
        )}

        {activeTab === 'inventory' && (
          <WebInventoryPage
            products={products}
            categories={categories}
            movements={movements}
            currencySymbol={activeBusiness.currencySymbol || '$'}
            userRole={userRole}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'shift' && (
          <ShiftRegisterPage
            session={registerSession}
            currencySymbol={activeBusiness.currencySymbol || '$'}
            userRole={userRole}
            onRefresh={loadData}
          />
        )}

        {activeTab === 'company' && (
          <CompanyProfilePage
            business={activeBusiness}
            members={members}
            onRefresh={loadData}
            currentUserRole={userRole}
          />
        )}

        {activeTab === 'ai' && <AIInsightsPage />}
      </main>
    </div>
  );
};
