import { create } from 'zustand';
import { User, Business, Branch, UserRole } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  activeBusiness: Business | null;
  activeBranch: Branch | null;
  role: UserRole;
  token: string | null;

  // Actions
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  setActiveBusiness: (business: Business) => void;
  setActiveBranch: (branch: Branch) => void;
  switchRole: (role: UserRole) => void;
}

const DEMO_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    businessId: 'biz-1',
    name: 'Main Downtown Store',
    code: 'DT-01',
    phone: '+1 555-0192',
    address: '123 Tech Central Avenue, Suite 100',
    isActive: true,
  },
  {
    id: 'branch-2',
    businessId: 'biz-1',
    name: 'Uptown Express Branch',
    code: 'UP-02',
    phone: '+1 555-0843',
    address: '890 Commerce Boulevard',
    isActive: true,
  },
];

const DEMO_BUSINESS: Business = {
  id: 'biz-1',
  name: 'Apex Supermarket & Electronics',
  legalName: 'Apex Retail Solutions LLC',
  businessType: 'RETAIL',
  taxNumber: 'TX-99882211',
  currency: 'USD',
  currencySymbol: '$',
  timezone: 'America/New_York',
  logoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150',
  phone: '+1 800-555-APEX',
  email: 'support@apexretail.com',
  address: '123 Tech Central Avenue',
  branches: DEMO_BRANCHES,
};

const DEMO_USER: User = {
  id: 'usr-1',
  name: 'Mubeen (Store Manager)',
  email: 'manager@apexretail.com',
  phone: '+1 555-0199',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true, // Default to true for instant preview
  user: DEMO_USER,
  activeBusiness: DEMO_BUSINESS,
  activeBranch: DEMO_BRANCHES[0],
  role: 'OWNER',
  token: 'mock-jwt-token-apex-retail',

  login: async (email: string) => {
    set({
      isAuthenticated: true,
      user: { ...DEMO_USER, email },
      token: 'mock-jwt-token-' + Date.now(),
    });
    return true;
  },

  logout: () => {
    set({
      isAuthenticated: false,
      user: null,
      token: null,
    });
  },

  setActiveBusiness: (business: Business) => {
    set({
      activeBusiness: business,
      activeBranch: business.branches[0] || null,
    });
  },

  setActiveBranch: (branch: Branch) => {
    set({ activeBranch: branch });
  },

  switchRole: (role: UserRole) => {
    set({ role });
  },
}));
