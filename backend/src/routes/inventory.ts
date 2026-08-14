import { Router, Response } from 'express';
import { getDb } from '../db/database';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET Stock Movements Ledger
router.get('/movements', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const businessId = (req.query.businessId as string) || req.businessId || 'biz-apex-retail';
    const db = await getDb();
    const movements = await db.all(
      `SELECT * FROM stock_movements WHERE business_id = ? ORDER BY created_at DESC LIMIT 100`,
      [businessId]
    );

    const mapped = movements.map((m) => ({
      id: m.id,
      businessId: m.business_id,
      branchId: m.branch_id,
      productId: m.product_id,
      productName: m.product_name,
      movementType: m.movement_type,
      quantity: m.quantity,
      unitCost: m.unit_cost,
      referenceType: m.reference_type,
      referenceId: m.reference_id,
      notes: m.notes,
      createdBy: m.created_by,
      createdAt: m.created_at
    }));

    return res.json(mapped);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// POST Record Stock Adjustment
router.post('/adjustments', requireRole(['OWNER', 'SUPERVISOR', 'INVENTORY_MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId, movementType, quantity, unitCost, notes, branchId } = req.body;
    const businessId = req.body.businessId || req.businessId || 'biz-apex-retail';
    const activeBranchId = branchId || req.branchId || 'br-apex-main';

    if (!productId || !movementType || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID, Movement Type, and Quantity are required.' });
    }

    const qty = Number(quantity);
    if (isNaN(qty) || qty === 0) {
      return res.status(400).json({ error: 'Quantity must be a non-zero number.' });
    }

    const db = await getDb();
    const product = await db.get('SELECT * FROM products WHERE id = ?', [productId]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Determine stock direction based on movement type
    let delta = qty;
    if (['SALE', 'ADJUSTMENT_OUT', 'TRANSFER_OUT', 'DAMAGE', 'EXPIRED', 'PURCHASE_RETURN'].includes(movementType)) {
      delta = -Math.abs(qty);
    } else if (['PURCHASE', 'ADJUSTMENT_IN', 'TRANSFER_IN', 'SALE_RETURN', 'OPENING_STOCK'].includes(movementType)) {
      delta = Math.abs(qty);
    }

    const newStock = Math.max(0, product.stock_quantity + delta);

    // Update product stock balance
    await db.run('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, productId]);

    // Record stock movement entry
    const movementId = `sm-${Date.now()}`;
    const cost = unitCost !== undefined ? Number(unitCost) : product.cost_price;
    const operatorName = req.user?.name || 'Inventory Supervisor';

    await db.run(
      `INSERT INTO stock_movements (id, business_id, branch_id, product_id, product_name, movement_type, quantity, unit_cost, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [movementId, businessId, activeBranchId, productId, product.name, movementType, Math.abs(qty), cost, notes || '', operatorName]
    );

    return res.status(201).json({
      message: `Stock adjustment (${movementType}) recorded successfully.`,
      productId,
      productName: product.name,
      previousStock: product.stock_quantity,
      newStock,
      movementType
    });
  } catch (error: any) {
    console.error('Error recording stock adjustment:', error);
    return res.status(500).json({ error: 'Failed to record stock adjustment' });
  }
});

export default router;
