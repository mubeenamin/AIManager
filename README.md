# AI Business Manager - Mobile Application

Production-ready mobile application for **AI Business Manager + POS + Inventory + Financials + AI Insights**, built using **Expo (React Native), TypeScript, Zustand, TanStack Query, and Expo Router**.

## Features Implemented

### 1. Multi-Tenant & Auth System
- **Role-Based Access**: Owner, Admin, Manager, Cashier, Inventory Manager, Accountant.
- **Tenant & Branch Switcher**: Dynamic active business & branch context switching.
- **Demo Quick Login**: Pre-populated one-click login for test roles.

### 2. Point of Sale (POS) Module (`/app/(main)/(tabs)/pos.tsx`)
- **Product Search & Barcode Scanner Integration**: Live camera / SKU scanner simulation.
- **Touch-Friendly Product Grid**: Category filtering and real-time stock availability badges.
- **Cart & Checkout**:
  - Quantity adjustment (+/-) & item level discounts.
  - Selected customer picker (Walk-in, Sarah Connor, David Miller).
  - Multiple payment options (Cash, Card, Mobile Wallet, Split).
  - Hold & Resume sale carts.
- **Thermal Invoice Receipts**: Printable/shareable digital receipt modal with QR code & financial breakdown.

### 3. Inventory & Stock Management (`/app/(main)/(tabs)/inventory.tsx`)
- **Catalog Management**: View stock balances, cost price vs selling price, minimum stock thresholds.
- **Stock Movement Ledger**: Immutable movement history (Sale, Adjustment, Purchase, Damage, Expired).
- **Stock Adjustments & Transfers**: Modal to record stock corrections & branch transfers.
- **Product Creator**: Add new products with SKU, Barcode, Prices, Unit, and initial stock.

### 4. Finance & Cash Register Session (`/app/(main)/(tabs)/finance.tsx`)
- **Sales History**: Complete invoice transaction log with receipt re-printing.
- **Expense Tracker**: Log outflow vouchers by category (Rent, Utilities, Supplies, Salaries) and payment methods.
- **Daily Cash Register Closing**: Open shift register float, calculate expected cash in drawer based on cash sales/expenses, and perform shift closing with discrepancy tracking.

### 5. AI Business Assistant (`/app/(main)/(tabs)/ai.tsx`)
- **Conversational Intelligence**: Real-time business insights assistant.
- **Prompt Action Chips**:
  - "Top 3 selling items today?"
  - "Low stock inventory alert?"
  - "Weekly profit margin summary?"
- **Visual Analytics**: Dynamic metric cards and chart bar graphics generated inside chat responses.

---

## Quick Start Guide

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start Expo Dev Server
npm run start

# Run on Web (Browser Preview)
npm run web

# Run on Android / iOS
npm run android
npm run ios
```