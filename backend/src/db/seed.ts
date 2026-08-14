import { getDb } from './database';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  const db = await getDb();

  // Check if users already exist
  const existingUsers = await db.get('SELECT COUNT(*) as count FROM users');
  if (existingUsers && existingUsers.count > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding initial database data...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const users = [
    { id: 'usr-owner-1', name: 'John Apex (Owner)', email: 'owner@apex.com', phone: '+1 555-0101' },
    { id: 'usr-supervisor-1', name: 'Sarah Connor (Supervisor)', email: 'supervisor@apex.com', phone: '+1 555-0102' },
    { id: 'usr-cashier-1', name: 'Alex Rivera (Cashier)', email: 'cashier@apex.com', phone: '+1 555-0103' },
    { id: 'usr-inventory-1', name: 'David Miller (Inventory Manager)', email: 'inventory@apex.com', phone: '+1 555-0104' },
    { id: 'usr-techowner-1', name: 'Elena Rostova (Tech Owner)', email: 'owner@techsphere.com', phone: '+1 555-0201' },
  ];

  for (const u of users) {
    await db.run(
      `INSERT INTO users (id, name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, passwordHash, u.phone]
    );
  }

  // 2. Create Businesses
  const businessApex = {
    id: 'biz-apex-retail',
    name: 'Apex Supermarket',
    legal_name: 'Apex Retail Enterprises Inc.',
    business_type: 'GROCERY',
    tax_number: 'TAX-889102',
    currency: 'USD',
    currency_symbol: '$',
    timezone: 'EST',
    phone: '+1 800-555-APEX',
    email: 'info@apexretail.com',
    address: '100 Metro Plaza, Suite 400, New York, NY',
  };

  const businessTech = {
    id: 'biz-techsphere',
    name: 'TechSphere Electronics',
    legal_name: 'TechSphere Solutions LLC',
    business_type: 'ELECTRONICS',
    tax_number: 'TAX-445199',
    currency: 'USD',
    currency_symbol: '$',
    timezone: 'PST',
    phone: '+1 800-555-TECH',
    email: 'contact@techsphere.com',
    address: '500 Innovation Way, San Jose, CA',
  };

  for (const b of [businessApex, businessTech]) {
    await db.run(
      `INSERT INTO businesses (id, name, legal_name, business_type, tax_number, currency, currency_symbol, timezone, phone, email, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [b.id, b.name, b.legal_name, b.business_type, b.tax_number, b.currency, b.currency_symbol, b.timezone, b.phone, b.email, b.address]
    );
  }

  // 3. Create Branches
  const branches = [
    { id: 'br-apex-main', business_id: 'biz-apex-retail', name: 'Apex Main Store', code: 'APX-01', phone: '+1 555-0111', address: 'Downtown Branch' },
    { id: 'br-apex-north', business_id: 'biz-apex-retail', name: 'Apex North Branch', code: 'APX-02', phone: '+1 555-0112', address: 'North Suburb Mall' },
    { id: 'br-tech-main', business_id: 'biz-techsphere', name: 'TechSphere Flagship', code: 'TS-01', phone: '+1 555-0211', address: 'Silicon Valley Hub' },
  ];

  for (const br of branches) {
    await db.run(
      `INSERT INTO branches (id, business_id, name, code, phone, address) VALUES (?, ?, ?, ?, ?, ?)`,
      [br.id, br.business_id, br.name, br.code, br.phone, br.address]
    );
  }

  // 4. Create Domain Memberships
  const memberships = [
    { id: 'mem-1', user_id: 'usr-owner-1', business_id: 'biz-apex-retail', role: 'OWNER', active_branch_id: 'br-apex-main' },
    { id: 'mem-2', user_id: 'usr-supervisor-1', business_id: 'biz-apex-retail', role: 'SUPERVISOR', active_branch_id: 'br-apex-main' },
    { id: 'mem-3', user_id: 'usr-cashier-1', business_id: 'biz-apex-retail', role: 'CASHIER', active_branch_id: 'br-apex-main' },
    { id: 'mem-4', user_id: 'usr-inventory-1', business_id: 'biz-apex-retail', role: 'INVENTORY_MANAGER', active_branch_id: 'br-apex-main' },
    { id: 'mem-5', user_id: 'usr-techowner-1', business_id: 'biz-techsphere', role: 'OWNER', active_branch_id: 'br-tech-main' },
  ];

  for (const m of memberships) {
    await db.run(
      `INSERT INTO memberships (id, user_id, business_id, role, active_branch_id) VALUES (?, ?, ?, ?, ?)`,
      [m.id, m.user_id, m.business_id, m.role, m.active_branch_id]
    );
  }

  // 5. Create Categories
  const categories = [
    { id: 'cat-gro-1', business_id: 'biz-apex-retail', name: 'Dairy & Eggs', description: 'Fresh farm milk, cheese, and eggs' },
    { id: 'cat-gro-2', business_id: 'biz-apex-retail', name: 'Beverages & Juices', description: 'Soft drinks, juices, coffee & tea' },
    { id: 'cat-gro-3', business_id: 'biz-apex-retail', name: 'Bakery & Snacks', description: 'Artisan bread, chips & pastries' },
    { id: 'cat-gro-4', business_id: 'biz-apex-retail', name: 'Fresh Produce', description: 'Organic fruits & fresh vegetables' },
    { id: 'cat-elec-1', business_id: 'biz-techsphere', name: 'Audio & Sound', description: 'Headphones, earbuds, and speakers' },
    { id: 'cat-elec-2', business_id: 'biz-techsphere', name: 'Accessories', description: 'Chargers, cables, power banks' },
  ];

  for (const c of categories) {
    await db.run(
      `INSERT INTO categories (id, business_id, name, description) VALUES (?, ?, ?, ?)`,
      [c.id, c.business_id, c.name, c.description]
    );
  }

  // 6. Create Products
  const products = [
    {
      id: 'prod-milk',
      business_id: 'biz-apex-retail',
      category_id: 'cat-gro-1',
      name: 'Organic Whole Milk 1L',
      sku: 'GRO-MLK-001',
      barcode: '890123456789',
      unit: 'bottle',
      cost_price: 2.20,
      selling_price: 3.99,
      tax_rate: 5.0,
      minimum_stock: 10,
      reorder_level: 15,
      stock_quantity: 45,
      image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300'
    },
    {
      id: 'prod-bread',
      business_id: 'biz-apex-retail',
      category_id: 'cat-gro-3',
      name: 'Artisan Whole Wheat Bread',
      sku: 'GRO-BRD-002',
      barcode: '890123456790',
      unit: 'loaf',
      cost_price: 1.50,
      selling_price: 2.99,
      tax_rate: 0.0,
      minimum_stock: 8,
      reorder_level: 12,
      stock_quantity: 4, // Low Stock Alert Trigger!
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300'
    },
    {
      id: 'prod-coffee',
      business_id: 'biz-apex-retail',
      category_id: 'cat-gro-2',
      name: 'Premium Arabica Coffee Beans 500g',
      sku: 'GRO-COF-003',
      barcode: '890123456791',
      unit: 'pack',
      cost_price: 7.50,
      selling_price: 13.50,
      tax_rate: 5.0,
      minimum_stock: 5,
      reorder_level: 10,
      stock_quantity: 28,
      image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300'
    },
    {
      id: 'prod-juice',
      business_id: 'biz-apex-retail',
      category_id: 'cat-gro-2',
      name: 'Fresh Pressed OJ 1L',
      sku: 'GRO-JUC-004',
      barcode: '890123456792',
      unit: 'bottle',
      cost_price: 2.80,
      selling_price: 4.99,
      tax_rate: 5.0,
      minimum_stock: 12,
      reorder_level: 20,
      stock_quantity: 32,
      image_url: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300'
    },
    {
      id: 'prod-cheese',
      business_id: 'biz-apex-retail',
      category_id: 'cat-gro-1',
      name: 'Aged Cheddar Cheese Block 250g',
      sku: 'GRO-CHS-005',
      barcode: '890123456793',
      unit: 'pack',
      cost_price: 3.20,
      selling_price: 5.49,
      tax_rate: 5.0,
      minimum_stock: 6,
      reorder_level: 10,
      stock_quantity: 18,
      image_url: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=300'
    },
    {
      id: 'prod-headphones',
      business_id: 'biz-techsphere',
      category_id: 'cat-elec-1',
      name: 'Wireless ANC Headphones Pro',
      sku: 'ELE-HDP-101',
      barcode: '790123456701',
      unit: 'box',
      cost_price: 65.00,
      selling_price: 129.99,
      tax_rate: 8.0,
      minimum_stock: 3,
      reorder_level: 5,
      stock_quantity: 14,
      image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'
    },
    {
      id: 'prod-charger',
      business_id: 'biz-techsphere',
      category_id: 'cat-elec-2',
      name: 'GaN 65W USB-C Dual Fast Charger',
      sku: 'ELE-CHG-102',
      barcode: '790123456702',
      unit: 'pcs',
      cost_price: 12.00,
      selling_price: 29.99,
      tax_rate: 8.0,
      minimum_stock: 10,
      reorder_level: 15,
      stock_quantity: 35,
      image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=300'
    }
  ];

  for (const p of products) {
    await db.run(
      `INSERT INTO products (id, business_id, category_id, name, sku, barcode, unit, cost_price, selling_price, tax_rate, minimum_stock, reorder_level, stock_quantity, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.id, p.business_id, p.category_id, p.name, p.sku, p.barcode, p.unit, p.cost_price, p.selling_price, p.tax_rate, p.minimum_stock, p.reorder_level, p.stock_quantity, p.image_url]
    );

    // Record initial stock movement
    await db.run(
      `INSERT INTO stock_movements (id, business_id, branch_id, product_id, product_name, movement_type, quantity, unit_cost, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [`sm-init-${p.id}`, p.business_id, p.business_id === 'biz-apex-retail' ? 'br-apex-main' : 'br-tech-main', p.id, p.name, 'OPENING_STOCK', p.stock_quantity, p.cost_price, 'Initial Stock Setup', 'System Seed']
    );
  }

  // 7. Create Open Cash Register Session for Apex Main
  await db.run(
    `INSERT INTO register_sessions (id, business_id, branch_id, opened_by, opening_float, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['reg-sess-001', 'biz-apex-retail', 'br-apex-main', 'Alex Rivera (Cashier)', 150.00, 'OPEN', 'Morning shift float']
  );

  console.log('Database seeded successfully with demo companies, domain users, products & register session!');
}

if (require.main === module) {
  seedDatabase().catch((err) => {
    console.error('Seed error:', err);
  });
}
