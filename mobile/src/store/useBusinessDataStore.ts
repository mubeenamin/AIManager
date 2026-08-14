import { create } from 'zustand';
import {
  Product,
  Category,
  Customer,
  Supplier,
  Sale,
  StockMovement,
  Expense,
  CashRegisterSession,
  AIChatMessage,
  CartItem,
  PaymentMethod,
} from '../types';

interface BusinessDataState {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  stockMovements: StockMovement[];
  expenses: Expense[];
  activeCashSession: CashRegisterSession | null;
  aiChatMessages: AIChatMessage[];

  // Actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
  recordSaleTransaction: (saleData: {
    customerId?: string;
    customerName?: string;
    items: CartItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    paidAmount: number;
    paymentMethod: PaymentMethod;
    cashierName: string;
    cashierId: string;
    notes?: string;
  }) => Sale;

  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'outstandingBalance' | 'loyaltyPoints'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'outstandingBalance'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'expenseDate'>) => void;

  openCashRegister: (openingFloat: number, openedBy: string) => void;
  closeCashRegister: (actualCash: number, notes?: string) => void;

  sendAIMessage: (prompt: string) => void;
}

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', businessId: 'biz-1', name: 'Fresh Produce', description: 'Fruits & Vegetables', isActive: true },
  { id: 'cat-2', businessId: 'biz-1', name: 'Beverages', description: 'Soft drinks, juices, coffee & tea', isActive: true },
  { id: 'cat-3', businessId: 'biz-1', name: 'Electronics', description: 'Gadgets, chargers & cables', isActive: true },
  { id: 'cat-4', businessId: 'biz-1', name: 'Bakery & Snacks', description: 'Fresh bread, cookies & chips', isActive: true },
  { id: 'cat-5', businessId: 'biz-1', name: 'Dairy & Eggs', description: 'Milk, cheese, butter & eggs', isActive: true },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    businessId: 'biz-1',
    categoryId: 'cat-2',
    categoryName: 'Beverages',
    name: 'Organic Cold Brew Coffee 330ml',
    sku: 'BEV-CB-001',
    barcode: '890123456701',
    unit: 'Bottle',
    costPrice: 1.80,
    sellingPrice: 3.99,
    taxRate: 5,
    minimumStock: 10,
    reorderLevel: 15,
    trackStock: true,
    stockQuantity: 45,
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=200',
    isActive: true,
  },
  {
    id: 'prod-2',
    businessId: 'biz-1',
    categoryId: 'cat-3',
    categoryName: 'Electronics',
    name: 'Fast Charging USB-C Cable (2m)',
    sku: 'ELE-USBC-002',
    barcode: '890123456702',
    unit: 'Piece',
    costPrice: 4.50,
    sellingPrice: 12.99,
    taxRate: 5,
    minimumStock: 5,
    reorderLevel: 8,
    trackStock: true,
    stockQuantity: 18,
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200',
    isActive: true,
  },
  {
    id: 'prod-3',
    businessId: 'biz-1',
    categoryId: 'cat-1',
    categoryName: 'Fresh Produce',
    name: 'Fresh Organic Bananas (Bunch)',
    sku: 'PRD-BAN-003',
    barcode: '890123456703',
    unit: 'Kg',
    costPrice: 0.90,
    sellingPrice: 1.99,
    taxRate: 0,
    minimumStock: 15,
    reorderLevel: 20,
    trackStock: true,
    stockQuantity: 8, // Low stock!
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200',
    isActive: true,
  },
  {
    id: 'prod-4',
    businessId: 'biz-1',
    categoryId: 'cat-4',
    categoryName: 'Bakery & Snacks',
    name: 'Artisan Whole Wheat Sourdough',
    sku: 'BAK-SRD-004',
    barcode: '890123456704',
    unit: 'Loaf',
    costPrice: 2.20,
    sellingPrice: 4.80,
    taxRate: 5,
    minimumStock: 8,
    reorderLevel: 10,
    trackStock: true,
    stockQuantity: 24,
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
    isActive: true,
  },
  {
    id: 'prod-5',
    businessId: 'biz-1',
    categoryId: 'cat-5',
    categoryName: 'Dairy & Eggs',
    name: 'Farm Fresh Whole Milk 1L',
    sku: 'DY-MLK-005',
    barcode: '890123456705',
    unit: 'Liter',
    costPrice: 1.10,
    sellingPrice: 2.49,
    taxRate: 0,
    minimumStock: 12,
    reorderLevel: 15,
    trackStock: true,
    stockQuantity: 4, // Critical stock!
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200',
    isActive: true,
  },
  {
    id: 'prod-6',
    businessId: 'biz-1',
    categoryId: 'cat-3',
    categoryName: 'Electronics',
    name: 'Wireless Bluetooth Earbuds Pro',
    sku: 'ELE-EAR-006',
    barcode: '890123456706',
    unit: 'Pair',
    costPrice: 22.00,
    sellingPrice: 49.99,
    taxRate: 5,
    minimumStock: 3,
    reorderLevel: 5,
    trackStock: true,
    stockQuantity: 12,
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200',
    isActive: true,
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    businessId: 'biz-1',
    name: 'Sarah Connor',
    phone: '+1 555-9011',
    email: 'sarah.c@example.com',
    address: '456 Elm St, Cityville',
    creditLimit: 500,
    outstandingBalance: 45.00,
    loyaltyPoints: 120,
    createdAt: '2026-01-15',
  },
  {
    id: 'cust-2',
    businessId: 'biz-1',
    name: 'David Miller',
    phone: '+1 555-8822',
    email: 'dmiller@example.com',
    address: '789 Oak Ave, Metro',
    creditLimit: 1000,
    outstandingBalance: 0.00,
    loyaltyPoints: 340,
    createdAt: '2026-02-01',
  },
  {
    id: 'cust-3',
    businessId: 'biz-1',
    name: 'Walk-in Customer',
    phone: 'N/A',
    creditLimit: 0,
    outstandingBalance: 0,
    loyaltyPoints: 0,
    createdAt: '2026-01-01',
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    businessId: 'biz-1',
    name: 'GreenField Farms Distributors',
    companyName: 'GreenField Organics Ltd',
    phone: '+1 800-GREEN-F',
    email: 'orders@greenfield.com',
    address: '100 Supply Chain Way',
    outstandingBalance: 320.00,
  },
  {
    id: 'sup-2',
    businessId: 'biz-1',
    name: 'NexTech Logistics Global',
    companyName: 'NexTech Components Inc',
    phone: '+1 800-NEXTECH',
    email: 'sales@nextech.com',
    address: '400 Silicon Parkway',
    outstandingBalance: 1150.00,
  },
];

const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-101',
    businessId: 'biz-1',
    branchId: 'branch-1',
    invoiceNumber: 'INV-2026-1001',
    customerId: 'cust-1',
    customerName: 'Sarah Connor',
    items: [
      {
        product: INITIAL_PRODUCTS[0],
        quantity: 2,
        unitPrice: 3.99,
        costPrice: 1.80,
        discountPercentage: 0,
        taxRate: 5,
        itemTotal: 7.98,
      },
      {
        product: INITIAL_PRODUCTS[3],
        quantity: 1,
        unitPrice: 4.80,
        costPrice: 2.20,
        discountPercentage: 0,
        taxRate: 5,
        itemTotal: 4.80,
      },
    ],
    subtotal: 12.78,
    discountAmount: 0,
    taxAmount: 0.64,
    totalAmount: 13.42,
    paidAmount: 13.42,
    dueAmount: 0,
    paymentMethod: 'CASH',
    paymentStatus: 'PAID',
    saleDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    cashierName: 'Mubeen',
    cashierId: 'usr-1',
  },
  {
    id: 'sale-102',
    businessId: 'biz-1',
    branchId: 'branch-1',
    invoiceNumber: 'INV-2026-1002',
    customerId: 'cust-2',
    customerName: 'David Miller',
    items: [
      {
        product: INITIAL_PRODUCTS[1],
        quantity: 1,
        unitPrice: 12.99,
        costPrice: 4.50,
        discountPercentage: 10,
        taxRate: 5,
        itemTotal: 11.69,
      },
    ],
    subtotal: 12.99,
    discountAmount: 1.30,
    taxAmount: 0.58,
    totalAmount: 12.27,
    paidAmount: 12.27,
    dueAmount: 0,
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    saleDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    cashierName: 'Mubeen',
    cashierId: 'usr-1',
  },
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    businessId: 'biz-1',
    branchId: 'branch-1',
    category: 'Utilities',
    title: 'Electricity & Internet Bill',
    amount: 145.00,
    paymentMethod: 'BANK_TRANSFER',
    expenseDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    createdBy: 'Mubeen',
  },
  {
    id: 'exp-2',
    businessId: 'biz-1',
    branchId: 'branch-1',
    category: 'Supplies',
    title: 'Thermal Printer Paper Rolls (Pack of 20)',
    amount: 35.50,
    paymentMethod: 'CASH',
    expenseDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    createdBy: 'Mubeen',
  },
];

const INITIAL_AI_CHAT: AIChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: 'Hello Mubeen! I am your AI Business Manager. I have analyzed today\'s sales, stock movements, and store expenses. How can I assist you right now?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    metricsData: [
      { label: "Today's Revenue", value: '$25.69', change: '+14%', trend: 'up' },
      { label: 'Gross Margin', value: '58.2%', change: '+3.1%', trend: 'up' },
      { label: 'Low Stock Items', value: '2 Items', change: 'Alert', trend: 'down' },
    ],
  },
];

export const useBusinessDataStore = create<BusinessDataState>((set, get) => ({
  categories: INITIAL_CATEGORIES,
  products: INITIAL_PRODUCTS,
  customers: INITIAL_CUSTOMERS,
  suppliers: INITIAL_SUPPLIERS,
  sales: INITIAL_SALES,
  stockMovements: [],
  expenses: INITIAL_EXPENSES,
  activeCashSession: {
    id: 'session-001',
    businessId: 'biz-1',
    branchId: 'branch-1',
    openedBy: 'Mubeen',
    openedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    openingFloat: 200.00,
    cashSalesAmount: 13.42,
    cardSalesAmount: 12.27,
    otherSalesAmount: 0,
    expenseAmount: 35.50,
    expectedCash: 177.92,
    status: 'OPEN',
  },
  aiChatMessages: INITIAL_AI_CHAT,

  addProduct: (productData) => {
    const newProduct: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
    };
    set((state) => ({ products: [newProduct, ...state.products] }));
  },

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    }));
  },

  addStockMovement: (movementData) => {
    const newMovement: StockMovement = {
      ...movementData,
      id: 'mov-' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    // Also update product stock quantity
    const { products } = get();
    const product = products.find((p) => p.id === movementData.productId);
    if (product) {
      let delta = movementData.quantity;
      if (
        movementData.movementType === 'SALE' ||
        movementData.movementType === 'ADJUSTMENT_OUT' ||
        movementData.movementType === 'DAMAGE' ||
        movementData.movementType === 'EXPIRED' ||
        movementData.movementType === 'TRANSFER_OUT' ||
        movementData.movementType === 'PURCHASE_RETURN'
      ) {
        delta = -Math.abs(delta);
      } else {
        delta = Math.abs(delta);
      }

      const updatedQty = Math.max(0, product.stockQuantity + delta);
      get().updateProduct(product.id, { stockQuantity: updatedQty });
    }

    set((state) => ({ stockMovements: [newMovement, ...state.stockMovements] }));
  },

  recordSaleTransaction: (saleData) => {
    const nextInvNumber = 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      businessId: 'biz-1',
      branchId: 'branch-1',
      invoiceNumber: nextInvNumber,
      customerId: saleData.customerId,
      customerName: saleData.customerName || 'Walk-in Customer',
      items: saleData.items,
      subtotal: saleData.subtotal,
      discountAmount: saleData.discountAmount,
      taxAmount: saleData.taxAmount,
      totalAmount: saleData.totalAmount,
      paidAmount: saleData.paidAmount,
      dueAmount: Math.max(0, saleData.totalAmount - saleData.paidAmount),
      paymentMethod: saleData.paymentMethod,
      paymentStatus: saleData.paidAmount >= saleData.totalAmount ? 'PAID' : saleData.paidAmount > 0 ? 'PARTIAL' : 'UNPAID',
      saleDate: new Date().toISOString(),
      cashierName: saleData.cashierName,
      cashierId: saleData.cashierId,
      notes: saleData.notes,
    };

    // Deduct stock for each sale item
    saleData.items.forEach((item) => {
      get().addStockMovement({
        businessId: 'biz-1',
        branchId: 'branch-1',
        productId: item.product.id,
        productName: item.product.name,
        movementType: 'SALE',
        quantity: item.quantity,
        unitCost: item.costPrice,
        referenceType: 'SALE',
        referenceId: newSale.id,
        createdBy: saleData.cashierName,
      });
    });

    // Update active cash session if open
    const activeSession = get().activeCashSession;
    if (activeSession && activeSession.status === 'OPEN') {
      let cashDelta = 0;
      let cardDelta = 0;
      let otherDelta = 0;

      if (saleData.paymentMethod === 'CASH') cashDelta = saleData.paidAmount;
      else if (saleData.paymentMethod === 'CARD') cardDelta = saleData.paidAmount;
      else otherDelta = saleData.paidAmount;

      const newCashSales = activeSession.cashSalesAmount + cashDelta;
      const newCardSales = activeSession.cardSalesAmount + cardDelta;
      const newOtherSales = activeSession.otherSalesAmount + otherDelta;
      const expectedCash = activeSession.openingFloat + newCashSales - activeSession.expenseAmount;

      set({
        activeCashSession: {
          ...activeSession,
          cashSalesAmount: newCashSales,
          cardSalesAmount: newCardSales,
          otherSalesAmount: newOtherSales,
          expectedCash,
        },
      });
    }

    set((state) => ({ sales: [newSale, ...state.sales] }));
    return newSale;
  },

  addCustomer: (customerData) => {
    const newCustomer: Customer = {
      ...customerData,
      id: 'cust-' + Date.now(),
      outstandingBalance: 0,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((state) => ({ customers: [newCustomer, ...state.customers] }));
  },

  addSupplier: (supplierData) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: 'sup-' + Date.now(),
      outstandingBalance: 0,
    };
    set((state) => ({ suppliers: [newSupplier, ...state.suppliers] }));
  },

  addExpense: (expenseData) => {
    const newExpense: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now(),
      expenseDate: new Date().toISOString(),
    };

    // Update cash session if paid in cash
    const activeSession = get().activeCashSession;
    if (activeSession && activeSession.status === 'OPEN' && expenseData.paymentMethod === 'CASH') {
      const updatedExpenseAmount = activeSession.expenseAmount + expenseData.amount;
      const expectedCash = activeSession.openingFloat + activeSession.cashSalesAmount - updatedExpenseAmount;
      set({
        activeCashSession: {
          ...activeSession,
          expenseAmount: updatedExpenseAmount,
          expectedCash,
        },
      });
    }

    set((state) => ({ expenses: [newExpense, ...state.expenses] }));
  },

  openCashRegister: (openingFloat: number, openedBy: string) => {
    const newSession: CashRegisterSession = {
      id: 'session-' + Date.now(),
      businessId: 'biz-1',
      branchId: 'branch-1',
      openedBy,
      openedAt: new Date().toISOString(),
      openingFloat,
      cashSalesAmount: 0,
      cardSalesAmount: 0,
      otherSalesAmount: 0,
      expenseAmount: 0,
      expectedCash: openingFloat,
      status: 'OPEN',
    };
    set({ activeCashSession: newSession });
  },

  closeCashRegister: (actualCash: number, notes?: string) => {
    const current = get().activeCashSession;
    if (!current) return;

    const difference = actualCash - current.expectedCash;
    set({
      activeCashSession: {
        ...current,
        closedAt: new Date().toISOString(),
        actualCash,
        difference,
        status: 'CLOSED',
        notes,
      },
    });
  },

  sendAIMessage: (prompt: string) => {
    const userMsg: AIChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({ aiChatMessages: [...state.aiChatMessages, userMsg] }));

    // Generate intelligent contextual response
    setTimeout(() => {
      const lower = prompt.toLowerCase();
      let responseText = '';
      let chartData;
      let metricsData;

      if (lower.includes('top') || lower.includes('best') || lower.includes('popular')) {
        responseText = 'Here are your top-performing products by revenue today:';
        chartData = {
          title: 'Top Products Revenue ($)',
          labels: ['USB-C Cable', 'Cold Brew Coffee', 'Whole Wheat Bread', 'Bluetooth Earbuds'],
          values: [12.99, 7.98, 4.80, 49.99],
        };
      } else if (lower.includes('stock') || lower.includes('low') || lower.includes('inventory')) {
        responseText = '⚠️ Attention: 2 items are currently below their minimum reorder threshold:';
        metricsData = [
          { label: 'Organic Bananas', value: '8 Kg Left', change: 'Reorder 20', trend: 'down' },
          { label: 'Farm Whole Milk', value: '4 L Left', change: 'Reorder 15', trend: 'down' },
        ];
      } else if (lower.includes('expense') || lower.includes('cost') || lower.includes('profit')) {
        responseText = 'Here is your current financial margin breakdown for this week:';
        metricsData = [
          { label: 'Gross Revenue', value: '$189.50', change: '+18%', trend: 'up' },
          { label: 'Total Expenses', value: '$180.50', change: '-5%', trend: 'up' },
          { label: 'Net Operating Profit', value: '$89.00', change: '+24%', trend: 'up' },
        ];
      } else {
        responseText = `Based on your request "${prompt}", I checked your live business store records. Everything is running smoothly across your Main Downtown Store. Revenue is up 14% compared to yesterday!`;
      }

      const assistantMsg: AIChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chartData,
        metricsData,
      };

      set((state) => ({ aiChatMessages: [...state.aiChatMessages, assistantMsg] }));
    }, 600);
  },
}));
