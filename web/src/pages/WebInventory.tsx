import React, { useState } from 'react';
import { Package, Plus, Search, Filter, AlertTriangle, ArrowUpRight, ArrowDownLeft, FileText, CheckCircle2, History } from 'lucide-react';
import { Product, Category, StockMovement, MovementType, UserRole } from '../types';
import { apiFetch } from '../api/client';

interface WebInventoryProps {
  products: Product[];
  categories: Category[];
  movements: StockMovement[];
  currencySymbol: string;
  userRole: UserRole;
  onRefresh: () => void;
}

export const WebInventoryPage: React.FC<WebInventoryProps> = ({
  products,
  categories,
  movements,
  currencySymbol,
  userRole,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'ledger'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [lowStockFilter, setLowStockFilter] = useState(false);

  // Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-gro-1');
  const [costPrice, setCostPrice] = useState('2.50');
  const [sellingPrice, setSellingPrice] = useState('4.99');
  const [taxRate, setTaxRate] = useState('5');
  const [minimumStock, setMinimumStock] = useState('10');
  const [stockQuantity, setStockQuantity] = useState('25');

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState('');
  const [adjustType, setAdjustType] = useState<MovementType>('PURCHASE');
  const [adjustQty, setAdjustQty] = useState('10');
  const [adjustNotes, setAdjustNotes] = useState('');

  const [message, setMessage] = useState<string | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLowStock = !lowStockFilter || p.stockQuantity <= p.minimumStock;
    return matchesCat && matchesSearch && matchesLowStock;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          name,
          sku,
          barcode,
          categoryId,
          costPrice,
          sellingPrice,
          taxRate,
          minimumStock,
          stockQuantity,
        }),
      });
      setMessage(`Product "${name}" added to catalog successfully!`);
      setShowAddProductModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    }
  };

  const handleRecordAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/inventory/adjustments', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedProdId,
          movementType: adjustType,
          quantity: Number(adjustQty),
          notes: adjustNotes,
        }),
      });
      setMessage(`Stock adjustment (${adjustType}) recorded successfully!`);
      setShowAdjustModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to adjust stock');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Header & Main Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Inventory & Catalog System</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Manage product catalog, real-time stock balances, and immutable stock audit movements.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => setShowAdjustModal(true)}
            className="btn btn-secondary"
          >
            <History size={18} /> Record Stock Adjustment
          </button>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="btn btn-primary"
          >
            <Plus size={18} /> Add New Product
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {/* Tabs & Search Filters */}
      <div className="glass-panel" style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`btn ${activeTab === 'catalog' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Package size={18} /> Product Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`btn ${activeTab === 'ledger' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <History size={18} /> Stock Movement Audit Ledger
          </button>
        </div>

        {activeTab === 'catalog' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: 12 }} />
              <input
                type="text"
                placeholder="Search catalog..."
                className="input-field"
                style={{ paddingLeft: 36, width: 220 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`btn btn-sm ${lowStockFilter ? 'btn-danger' : 'btn-secondary'}`}
            >
              <AlertTriangle size={14} /> Low Stock Only
            </button>
          </div>
        )}
      </div>

      {/* Catalog Table View */}
      {activeTab === 'catalog' ? (
        <div className="glass-panel" style={{ padding: 24, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <th style={{ padding: '12px 16px' }}>PRODUCT NAME</th>
                <th style={{ padding: '12px 16px' }}>SKU & BARCODE</th>
                <th style={{ padding: '12px 16px' }}>CATEGORY</th>
                <th style={{ padding: '12px 16px' }}>COST PRICE</th>
                <th style={{ padding: '12px 16px' }}>SELLING PRICE</th>
                <th style={{ padding: '12px 16px' }}>TAX %</th>
                <th style={{ padding: '12px 16px' }}>STOCK BALANCE</th>
                <th style={{ padding: '12px 16px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isLow = p.stockQuantity <= p.minimumStock;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'}
                          alt={p.name}
                          style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
                        />
                        {p.name}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      <div>{p.sku}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.barcode}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge badge-supervisor">{p.categoryName || 'General'}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{currencySymbol}{p.costPrice.toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--accent)' }}>
                      {currencySymbol}{p.sellingPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 16px' }}>{p.taxRate}%</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${isLow ? 'badge-danger' : 'badge-cashier'}`}>
                        {p.stockQuantity} {p.unit} {isLow && '(LOW)'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => {
                          setSelectedProdId(p.id);
                          setShowAdjustModal(true);
                        }}
                        className="btn btn-secondary btn-sm"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Stock Movement Audit Ledger */
        <div className="glass-panel" style={{ padding: 24, overflowX: 'auto' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Immutable Stock Movements Audit Log</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <th style={{ padding: '12px 16px' }}>TIMESTAMP</th>
                <th style={{ padding: '12px 16px' }}>PRODUCT</th>
                <th style={{ padding: '12px 16px' }}>MOVEMENT TYPE</th>
                <th style={{ padding: '12px 16px' }}>QUANTITY</th>
                <th style={{ padding: '12px 16px' }}>UNIT COST</th>
                <th style={{ padding: '12px 16px' }}>NOTES / REF</th>
                <th style={{ padding: '12px 16px' }}>OPERATOR</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((m) => {
                const isInbound = ['PURCHASE', 'ADJUSTMENT_IN', 'TRANSFER_IN', 'OPENING_STOCK'].includes(m.movementType);
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{m.productName}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`badge ${isInbound ? 'badge-cashier' : 'badge-warning'}`}>
                        {isInbound ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />} {m.movementType}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: isInbound ? '#34d399' : '#f87171' }}>
                      {isInbound ? '+' : '-'}{m.quantity}
                    </td>
                    <td style={{ padding: '14px 16px' }}>{currencySymbol}{m.unitCost.toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{m.notes || m.referenceType || '-'}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{m.createdBy}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Add Product */}
      {showAddProductModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16 }}>Add New Product</h2>
            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Product Name</label>
                <input type="text" required placeholder="e.g. Arabica Coffee Beans 500g" className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>SKU Code</label>
                  <input type="text" required placeholder="GRO-COF-001" className="input-field" value={sku} onChange={(e) => setSku(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Barcode (EAN/UPC)</label>
                  <input type="text" placeholder="8901234567" className="input-field" value={barcode} onChange={(e) => setBarcode(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Category</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input-field select-field">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Cost Price</label>
                  <input type="number" step="0.01" required className="input-field" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Selling Price</label>
                  <input type="number" step="0.01" required className="input-field" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Initial Stock</label>
                  <input type="number" required className="input-field" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddProductModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Stock Adjustment */}
      {showAdjustModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 16 }}>Record Stock Movement</h2>
            <form onSubmit={handleRecordAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Select Product</label>
                <select value={selectedProdId} onChange={(e) => setSelectedProdId(e.target.value)} className="input-field select-field">
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Current: {p.stockQuantity})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Movement Reason</label>
                  <select value={adjustType} onChange={(e) => setAdjustType(e.target.value as MovementType)} className="input-field select-field">
                    <option value="PURCHASE">Stock Purchase In</option>
                    <option value="ADJUSTMENT_IN">Adjustment (In)</option>
                    <option value="ADJUSTMENT_OUT">Adjustment (Out)</option>
                    <option value="DAMAGE">Damage / Broken</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Quantity</label>
                  <input type="number" required className="input-field" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Notes / Reference</label>
                <input type="text" placeholder="e.g. Supplier PO #991" className="input-field" value={adjustNotes} onChange={(e) => setAdjustNotes(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAdjustModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Record Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
