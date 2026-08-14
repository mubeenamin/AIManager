import { Router, Response } from 'express';
import { getDb } from '../db/database';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET Categories
router.get('/categories', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const businessId = (req.query.businessId as string) || req.businessId || 'biz-apex-retail';
    const db = await getDb();
    const categories = await db.all('SELECT * FROM categories WHERE business_id = ? AND is_active = 1', [businessId]);
    return res.json(categories);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST Category
router.post('/categories', requireRole(['OWNER', 'SUPERVISOR', 'INVENTORY_MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, parentId } = req.body;
    const businessId = req.body.businessId || req.businessId || 'biz-apex-retail';

    if (!name) {
      return res.status(400).json({ error: 'Category name is required.' });
    }

    const db = await getDb();
    const categoryId = `cat-${Date.now()}`;

    await db.run(
      'INSERT INTO categories (id, business_id, parent_id, name, description) VALUES (?, ?, ?, ?, ?)',
      [categoryId, businessId, parentId || null, name, description || '']
    );

    const category = await db.get('SELECT * FROM categories WHERE id = ?', [categoryId]);
    return res.status(201).json(category);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

// GET Products
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const businessId = (req.query.businessId as string) || req.businessId || 'biz-apex-retail';
    const { search, categoryId, lowStockOnly } = req.query;

    const db = await getDb();
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.business_id = ? AND p.is_active = 1
    `;
    const params: any[] = [businessId];

    if (categoryId) {
      query += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (lowStockOnly === 'true') {
      query += ' AND p.stock_quantity <= p.minimum_stock';
    }

    query += ' ORDER BY p.name ASC';

    const products = await db.all(query, params);

    // Map database snake_case to camelCase expected by client
    const mappedProducts = products.map((p) => ({
      id: p.id,
      businessId: p.business_id,
      categoryId: p.category_id,
      categoryName: p.category_name,
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      unit: p.unit,
      costPrice: p.cost_price,
      sellingPrice: p.selling_price,
      taxRate: p.tax_rate,
      minimumStock: p.minimum_stock,
      reorderLevel: p.reorder_level,
      trackStock: Boolean(p.track_stock),
      stockQuantity: p.stock_quantity,
      imageUrl: p.image_url,
      isActive: Boolean(p.is_active)
    }));

    return res.json(mappedProducts);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST Product
router.post('/', requireRole(['OWNER', 'SUPERVISOR', 'INVENTORY_MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, sku, barcode, categoryId, costPrice, sellingPrice, taxRate, minimumStock, stockQuantity, unit, imageUrl } = req.body;
    const businessId = req.body.businessId || req.businessId || 'biz-apex-retail';

    if (!name || !sku || !costPrice || !sellingPrice || !categoryId) {
      return res.status(400).json({ error: 'Name, SKU, Category, Cost Price, and Selling Price are required.' });
    }

    const db = await getDb();
    const productId = `prod-${Date.now()}`;
    const initialQty = Number(stockQuantity) || 0;
    const cost = Number(costPrice);

    await db.run(
      `INSERT INTO products (id, business_id, category_id, name, sku, barcode, unit, cost_price, selling_price, tax_rate, minimum_stock, stock_quantity, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        productId,
        businessId,
        categoryId,
        name,
        sku,
        barcode || '',
        unit || 'pcs',
        cost,
        Number(sellingPrice),
        Number(taxRate) || 0,
        Number(minimumStock) || 5,
        initialQty,
        imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'
      ]
    );

    // Record initial stock movement
    if (initialQty > 0) {
      await db.run(
        `INSERT INTO stock_movements (id, business_id, branch_id, product_id, product_name, movement_type, quantity, unit_cost, notes, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`sm-${Date.now()}`, businessId, 'br-apex-main', productId, name, 'OPENING_STOCK', initialQty, cost, 'New Product Added', req.user?.name || 'System']
      );
    }

    const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    return res.status(201).json(newProduct);
  } catch (error: any) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT Product
router.put('/:id', requireRole(['OWNER', 'SUPERVISOR', 'INVENTORY_MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sku, barcode, categoryId, costPrice, sellingPrice, taxRate, minimumStock, unit, imageUrl } = req.body;

    const db = await getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.run(
      `UPDATE products
       SET name = ?, sku = ?, barcode = ?, category_id = ?, cost_price = ?, selling_price = ?, tax_rate = ?, minimum_stock = ?, unit = ?, image_url = ?
       WHERE id = ?`,
      [
        name || product.name,
        sku || product.sku,
        barcode !== undefined ? barcode : product.barcode,
        categoryId || product.category_id,
        costPrice !== undefined ? Number(costPrice) : product.cost_price,
        sellingPrice !== undefined ? Number(sellingPrice) : product.selling_price,
        taxRate !== undefined ? Number(taxRate) : product.tax_rate,
        minimumStock !== undefined ? Number(minimumStock) : product.minimum_stock,
        unit || product.unit,
        imageUrl || product.image_url,
        id
      ]
    );

    const updated = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE Product
router.delete('/:id', requireRole(['OWNER', 'SUPERVISOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    await db.run('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    return res.json({ message: 'Product deactivated successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
