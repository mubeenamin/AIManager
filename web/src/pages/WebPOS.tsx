import React, { useState } from 'react';
import { Search, Barcode, ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Wallet, Printer, CheckCircle, PauseCircle, AlertTriangle, X } from 'lucide-react';
import { Product, Category, CartItem, PaymentMethod, SaleReceipt, UserRole, RegisterSession } from '../types';
import { apiFetch } from '../api/client';

interface WebPOSProps {
  products: Product[];
  categories: Category[];
  currencySymbol: string;
  userRole: UserRole;
  registerSession: RegisterSession | null;
  onSaleComplete: () => void;
}

export const WebPOSPage: React.FC<WebPOSProps> = ({
  products,
  categories,
  currencySymbol,
  userRole,
  registerSession,
  onSaleComplete,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('Walk-in Customer');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<SaleReceipt | null>(null);

  // Filter products by category and search term
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                itemTotal: (item.quantity + 1) * item.unitPrice * (1 - item.discountPercentage / 100) * (1 + item.taxRate / 100),
              }
            : item
        );
      }
      const itemTotal = product.sellingPrice * (1 + (product.taxRate || 0) / 100);
      return [
        ...prevCart,
        {
          product,
          quantity: 1,
          unitPrice: product.sellingPrice,
          discountPercentage: 0,
          taxRate: product.taxRate || 0,
          itemTotal,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const itemTotal = newQty * item.unitPrice * (1 - item.discountPercentage / 100) * (1 + item.taxRate / 100);
            return { ...item, quantity: newQty, itemTotal };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const taxTotal = cart.reduce((acc, item) => {
    const lineSubtotal = item.quantity * item.unitPrice * (1 - item.discountPercentage / 100);
    return acc + (lineSubtotal * item.taxRate) / 100;
  }, 0);
  const grandTotal = Math.max(0, subtotal - discountAmount + taxTotal);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const response = await apiFetch<{ message: string; sale: SaleReceipt }>('/pos/checkout', {
        method: 'POST',
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercentage: item.discountPercentage,
          })),
          customerName: selectedCustomer,
          paymentMethod,
          discountAmount,
        }),
      });

      setReceipt(response.sale);
      setCart([]);
      onSaleComplete();
    } catch (err: any) {
      alert(err.message || 'POS Checkout failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, height: 'calc(100vh - 120px)' }}>
      
      {/* Left Panel: Catalog Grid & Search */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden' }}>
        
        {/* Search Bar & Barcode Scanner Simulation */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
            <input
              type="text"
              placeholder="Search product by name, SKU, or scan Barcode..."
              className="input-field"
              style={{ paddingLeft: 42 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            onClick={() => {
              // Simulate Barcode scan
              if (products.length > 0) {
                const randomProd = products[Math.floor(Math.random() * products.length)];
                addToCart(randomProd);
              }
            }}
            className="btn btn-secondary"
            title="Scan SKU / Barcode"
          >
            <Barcode size={20} color="var(--accent)" />
            Scan Barcode
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`btn btn-sm ${selectedCategory === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Items ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`btn btn-sm ${selectedCategory === c.id ? 'btn-primary' : 'btn-secondary'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Cards Touch Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, overflowY: 'auto', paddingRight: 4, flex: 1 }}>
          {filteredProducts.map((p) => {
            const isLowStock = p.stockQuantity <= p.minimumStock;
            return (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className="glass-card"
                style={{
                  padding: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                {isLowStock && (
                  <span className="badge badge-danger" style={{ position: 'absolute', top: 8, right: 8, fontSize: '0.65rem' }}>
                    Low Stock: {p.stockQuantity}
                  </span>
                )}

                <div style={{ width: '100%', height: 100, borderRadius: 8, overflow: 'hidden', marginBottom: 10, background: '#0b0f19' }}>
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.categoryName || 'Catalog'}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', margin: '2px 0 6px 0', lineHeight: '1.2' }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {p.sku}</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 8 }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {currencySymbol}{p.sellingPrice.toFixed(2)}
                  </span>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
                    <Plus size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Right Panel: Cart & Checkout */}
      <div className="glass-panel" style={{ padding: 20, display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Cart Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingCart size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>POS Sale Cart</h2>
          </div>
          <span className="badge badge-supervisor">{cart.length} Items</span>
        </div>

        {/* Customer Picker */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Customer</label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="input-field select-field"
            style={{ fontSize: '0.85rem' }}
          >
            <option value="Walk-in Customer">Walk-in Customer</option>
            <option value="Sarah Connor (VIP)">Sarah Connor (VIP)</option>
            <option value="David Miller">David Miller</option>
          </select>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center' }}>
              <ShoppingCart size={48} strokeWidth={1} style={{ marginBottom: 12 }} />
              <p style={{ fontSize: '0.9rem' }}>POS Cart is empty.</p>
              <p style={{ fontSize: '0.75rem', marginTop: 4 }}>Tap product cards on the left to add items.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="glass-card" style={{ padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{item.product.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {currencySymbol}{item.unitPrice.toFixed(2)} x {item.quantity}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => updateQuantity(item.product.id, -1)} className="btn btn-secondary btn-icon" style={{ width: 26, height: 26 }}>
                    <Minus size={12} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', width: 20, textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, 1)} className="btn btn-secondary btn-icon" style={{ width: 26, height: 26 }}>
                    <Plus size={12} />
                  </button>
                  <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: 4 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total Calculations */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Subtotal:</span>
            <span>{currencySymbol}{subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Tax Amount:</span>
            <span>{currencySymbol}{taxTotal.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Total:</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>
              {currencySymbol}{grandTotal.toFixed(2)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, margin: '8px 0' }}>
            <button
              onClick={() => setPaymentMethod('CASH')}
              className={`btn btn-sm ${paymentMethod === 'CASH' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Banknote size={14} /> Cash
            </button>
            <button
              onClick={() => setPaymentMethod('CARD')}
              className={`btn btn-sm ${paymentMethod === 'CARD' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <CreditCard size={14} /> Card
            </button>
            <button
              onClick={() => setPaymentMethod('MOBILE_WALLET')}
              className={`btn btn-sm ${paymentMethod === 'MOBILE_WALLET' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Wallet size={14} /> Wallet
            </button>
          </div>

          <button
            disabled={cart.length === 0 || isProcessing}
            onClick={handleCheckout}
            className="btn btn-success"
            style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}
          >
            {isProcessing ? 'Processing Sale...' : `Complete Checkout (${currencySymbol}${grandTotal.toFixed(2)})`}
          </button>
        </div>

      </div>

      {/* Printable Receipt Modal */}
      {receipt && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ width: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>POS Sale Invoice Receipt</h3>
              <button onClick={() => setReceipt(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="printable-receipt" style={{ background: '#ffffff', color: '#000000', borderRadius: 12, padding: 20, fontFamily: 'monospace' }}>
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>APEX SUPERMARKET</h2>
                <div style={{ fontSize: '0.8rem' }}>100 Metro Plaza, New York, NY</div>
                <div style={{ fontSize: '0.8rem' }}>Tel: +1 800-555-APEX</div>
                <div style={{ fontSize: '0.75rem', marginTop: 6, borderBottom: '1px dashed #000', paddingBottom: 6 }}>
                  Invoice #: {receipt.invoiceNumber} | {new Date(receipt.saleDate).toLocaleDateString()}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.8rem' }}>Customer: {receipt.customerName}</div>
                <div style={{ fontSize: '0.8rem' }}>Cashier: {receipt.cashierName}</div>
              </div>

              <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse', marginBottom: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #000' }}>
                    <th style={{ textAlign: 'left' }}>Item</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.items.map((item, i) => (
                    <tr key={i}>
                      <td>{item.productName}</td>
                      <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right' }}>{currencySymbol}{item.itemTotal.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ borderTop: '1px dashed #000', paddingTop: 8, fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal:</span>
                  <span>{currencySymbol}{receipt.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax:</span>
                  <span>{currencySymbol}{receipt.taxAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', marginTop: 4 }}>
                  <span>TOTAL PAID ({receipt.paymentMethod}):</span>
                  <span>{currencySymbol}{receipt.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: 20, fontSize: '0.75rem' }}>
                Thank you for shopping with us!
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button onClick={() => window.print()} className="btn btn-secondary" style={{ flex: 1 }}>
                <Printer size={18} /> Print Receipt
              </button>
              <button onClick={() => setReceipt(null)} className="btn btn-primary" style={{ flex: 1 }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
