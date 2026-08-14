export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CASHIER' | 'INVENTORY_MANAGER' | 'ACCOUNTANT' | 'STAFF';

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
  timezone: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  branches: Branch[];
}

export interface Membership {
  id: string;
  userId: string;
  businessId: string;
  role: UserRole;
  activeBranchId: string;
}

export interface Category {
  id: string;
  businessId: string;
  parentId?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
}

export interface Product {
  id: string;
  businessId: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  sku: string;
  barcode: string;
  description?: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number; // e.g., 5 for 5%
  minimumStock: number;
  reorderLevel: number;
  trackStock: boolean;
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
  variants?: ProductVariant[];
}

export type StockMovementType =
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
  variantId?: string;
  movementType: StockMovementType;
  quantity: number;
  unitCost: number;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  creditLimit: number;
  outstandingBalance: number;
  loyaltyPoints: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  companyName: string;
  phone: string;
  email?: string;
  address?: string;
  outstandingBalance: number;
}

export interface CartItem {
  product: Product;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discountPercentage: number;
  taxRate: number;
  itemTotal: number;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'MOBILE_WALLET' | 'CREDIT' | 'SPLIT';

export interface SalePayment {
  id: string;
  saleId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  referenceNo?: string;
  paidAt: string;
}

export interface Sale {
  id: string;
  businessId: string;
  branchId: string;
  invoiceNumber: string;
  customerId?: string;
  customerName?: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  saleDate: string;
  cashierName: string;
  cashierId: string;
  notes?: string;
}

export interface HoldSale {
  id: string;
  holdCode: string;
  heldAt: string;
  items: CartItem[];
  customer?: Customer;
  notes?: string;
}

export interface Expense {
  id: string;
  businessId: string;
  branchId: string;
  category: 'Rent' | 'Utilities' | 'Salaries' | 'Supplies' | 'Marketing' | 'Maintenance' | 'Other';
  title: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  expenseDate: string;
  createdBy: string;
}

export interface CashRegisterSession {
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
  notes?: string;
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
