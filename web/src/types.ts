export type UserRole = 'OWNER' | 'ADMIN' | 'SUPERVISOR' | 'CASHIER' | 'INVENTORY_MANAGER' | 'ACCOUNTANT' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  code: string;
  phone?: string;
  address?: string;
  isActive: boolean;
}

export interface Business {
  id: string;
  name: string;
  legalName?: string;
  businessType: 'RETAIL' | 'GROCERY' | 'PHARMACY' | 'CLOTHING' | 'ELECTRONICS' | 'RESTAURANT' | 'WHOLESALE';
  taxNumber?: string;
  currency: string;
  currencySymbol: string;
  timezone?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  branches: Branch[];
}

export interface DomainUserMember {
  membership_id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  active_branch_id?: string;
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  sku: string;
  barcode: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number;
  minimumStock: number;
  reorderLevel?: number;
  trackStock: boolean;
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
}

export type MovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'SALE_RETURN'
  | 'PURCHASE_RETURN'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'OPENING_STOCK'
  | 'DAMAGE'
  | 'EXPIRED';

export interface StockMovement {
  id: string;
  businessId: string;
  branchId: string;
  productId: string;
  productName: string;
  movementType: MovementType;
  quantity: number;
  unitCost: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  taxRate: number;
  itemTotal: number;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_WALLET' | 'CREDIT' | 'SPLIT';

export interface SaleReceipt {
  id: string;
  invoiceNumber: string;
  businessId: string;
  branchId: string;
  customerName: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: PaymentMethod;
  cashierName: string;
  saleDate: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    itemTotal: number;
  }>;
}

export interface RegisterSession {
  id: string;
  businessId: string;
  branchId: string;
  openedBy: string;
  openedAt: string;
  closedAt?: string;
  openingFloat: number;
  cashSalesAmount: number;
  cardSalesAmount: number;
  otherSalesAmount: number;
  expenseAmount: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  status: 'OPEN' | 'CLOSED';
}

export interface Expense {
  id: string;
  businessId: string;
  branchId: string;
  category: string;
  title: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  expenseDate: string;
  createdBy: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  chartData?: {
    title: string;
    labels: string[];
    values: number[];
  };
  metricsData?: Array<{
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
  }>;
}
