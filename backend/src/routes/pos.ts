import { Router, Response } from 'express';
import { getDb } from '../db/database';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET Sales History
router.get('/sales', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const businessId = (req.query.businessId as string) || req.businessId || 'biz-apex-retail';
    const db = await getDb();
    const sales = await db.all(
      `SELECT * FROM sales WHERE business_id = ? ORDER BY created_at DESC LIMIT 50`,
      [businessId]
    );

    for (const sale of sales) {
      const items = await db.all('SELECT * FROM sale_items WHERE sale_id = ?', [sale.id]);
      sale.items = items.map((i) => ({
        productId: i.product_id,
        productName: i.product_name,
        quantity: i.quantity,
        unitPrice: i.unit_price,
        costPrice: i.cost_price,
        taxRate: i.tax_rate,
        itemTotal: i.item_total
      }));
    }

    return res.json(sales);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// POST Sale Checkout (Process POS Transaction)
router.post('/checkout', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, customerName, customerId, paymentMethod, discountAmount, notes, cashierName } = req.body;
    const businessId = req.body.businessId || req.businessId || 'biz-apex-retail';
    const branchId = req.body.branchId || req.branchId || 'br-apex-main';

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart must contain at least one product item.' });
    }

    const db = await getDb();

    // Check open shift register
    const openSession = await db.get(
      `SELECT * FROM register_sessions WHERE business_id = ? AND branch_id = ? AND status = 'OPEN'`,
      [businessId, branchId]
    );

    let subtotal = 0;
    let taxTotal = 0;
    const processedItems: any[] = [];

    // Verify products & calculate amounts
    for (const cartItem of items) {
      const p = await db.get('SELECT * FROM products WHERE id = ?', [cartItem.productId || cartItem.product?.id]);
      if (!p) {
        return res.status(404).json({ error: `Product not found for ID: ${cartItem.productId}` });
      }

      const qty = Number(cartItem.quantity) || 1;
      const unitPrice = Number(cartItem.unitPrice || p.selling_price);
      const discountPct = Number(cartItem.discountPercentage) || 0;

      const lineSubtotal = qty * unitPrice * (1 - discountPct / 100);
      const lineTax = (lineSubtotal * (p.tax_rate || 0)) / 100;
      const lineTotal = lineSubtotal + lineTax;

      subtotal += lineSubtotal;
      taxTotal += lineTax;

      processedItems.push({
        product: p,
        quantity: qty,
        unitPrice,
        costPrice: p.cost_price,
        discountPercentage: discountPct,
        taxRate: p.tax_rate,
        itemTotal: lineTotal
      });
    }

    const discount = Number(discountAmount) || 0;
    const totalAmount = Math.max(0, subtotal - discount + taxTotal);
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const saleId = `sale-${Date.now()}`;
    const operatorName = cashierName || req.user?.name || 'Cashier (Alex Rivera)';
    const operatorId = req.user?.id || 'usr-cashier-1';

    // Insert Sale
    await db.run(
      `INSERT INTO sales (id, business_id, branch_id, invoice_number, customer_id, customer_name, subtotal, discount_amount, tax_amount, total_amount, paid_amount, due_amount, payment_method, payment_status, cashier_id, cashier_name, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        saleId,
        businessId,
        branchId,
        invoiceNumber,
        customerId || null,
        customerName || 'Walk-in Customer',
        subtotal,
        discount,
        taxTotal,
        totalAmount,
        totalAmount, // paid amount
        0, // due amount
        paymentMethod || 'CASH',
        'PAID',
        operatorId,
        operatorName,
        notes || ''
      ]
    );

    // Insert Sale Items & Deduct Stock
    for (const item of processedItems) {
      const itemId = `si-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      await db.run(
        `INSERT INTO sale_items (id, sale_id, product_id, product_name, quantity, unit_price, cost_price, discount_percentage, tax_rate, item_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          saleId,
          item.product.id,
          item.product.name,
          item.quantity,
          item.unitPrice,
          item.costPrice,
          item.discountPercentage,
          item.taxRate,
          item.itemTotal
        ]
      );

      // Deduct stock balance
      const newStock = Math.max(0, item.product.stock_quantity - item.quantity);
      await db.run('UPDATE products SET stock_quantity = ? WHERE id = ?', [newStock, item.product.id]);

      // Record Stock Movement (SALE)
      await db.run(
        `INSERT INTO stock_movements (id, business_id, branch_id, product_id, product_name, movement_type, quantity, unit_cost, reference_type, reference_id, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`sm-${Date.now()}-${item.product.id}`, businessId, branchId, item.product.id, item.product.name, 'SALE', item.quantity, item.costPrice, 'SALE_INVOICE', saleId, operatorName]
      );
    }

    // Update Open Shift Register Tally
    if (openSession) {
      if (paymentMethod === 'CASH') {
        await db.run('UPDATE register_sessions SET cash_sales_amount = cash_sales_amount + ? WHERE id = ?', [totalAmount, openSession.id]);
      } else if (paymentMethod === 'CARD') {
        await db.run('UPDATE register_sessions SET card_sales_amount = card_sales_amount + ? WHERE id = ?', [totalAmount, openSession.id]);
      } else {
        await db.run('UPDATE register_sessions SET other_sales_amount = other_sales_amount + ? WHERE id = ?', [totalAmount, openSession.id]);
      }
    }

    return res.status(201).json({
      message: 'Sale completed successfully!',
      sale: {
        id: saleId,
        invoiceNumber,
        businessId,
        branchId,
        customerName: customerName || 'Walk-in Customer',
        subtotal,
        discountAmount: discount,
        taxAmount: taxTotal,
        totalAmount,
        paidAmount: totalAmount,
        paymentMethod: paymentMethod || 'CASH',
        cashierName: operatorName,
        saleDate: new Date().toISOString(),
        items: processedItems.map((i) => ({
          productName: i.product.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          itemTotal: i.itemTotal
        }))
      }
    });
  } catch (error: any) {
    console.error('Error processing checkout:', error);
    return res.status(500).json({ error: error.message || 'Checkout failed' });
  }
});

// GET Cash Register Session Status
router.get('/registers/session', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const businessId = (req.query.businessId as string) || req.businessId || 'biz-apex-retail';
    const branchId = (req.query.branchId as string) || req.branchId || 'br-apex-main';

    const db = await getDb();
    const session = await db.get(
      `SELECT * FROM register_sessions WHERE business_id = ? AND branch_id = ? AND status = 'OPEN'`,
      [businessId, branchId]
    );

    if (!session) {
      return res.json({ status: 'CLOSED', session: null });
    }

    const expectedCash = (session.opening_float || 0) + (session.cash_sales_amount || 0) - (session.expense_amount || 0);

    return res.json({
      status: 'OPEN',
      session: {
        id: session.id,
        businessId: session.business_id,
        branchId: session.branch_id,
        openedBy: session.opened_by,
        openedAt: session.opened_at,
        openingFloat: session.opening_float,
        cashSalesAmount: session.cash_sales_amount,
        cardSalesAmount: session.card_sales_amount,
        otherSalesAmount: session.other_sales_amount,
        expenseAmount: session.expense_amount,
        expectedCash,
        status: session.status
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch register session' });
  }
});

// POST Open Register Shift
router.post('/registers/open', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { openingFloat, notes, cashierName } = req.body;
    const businessId = req.body.businessId || req.businessId || 'biz-apex-retail';
    const branchId = req.body.branchId || req.branchId || 'br-apex-main';

    const db = await getDb();
    // Check if already open
    const existing = await db.get(
      `SELECT * FROM register_sessions WHERE business_id = ? AND branch_id = ? AND status = 'OPEN'`,
      [businessId, branchId]
    );

    if (existing) {
      return res.status(400).json({ error: 'Register shift is already open.' });
    }

    const sessionId = `reg-sess-${Date.now()}`;
    const operatorName = cashierName || req.user?.name || 'Cashier (Alex Rivera)';
    const floatVal = Number(openingFloat) || 0;

    await db.run(
      `INSERT INTO register_sessions (id, business_id, branch_id, opened_by, opening_float, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, businessId, branchId, operatorName, floatVal, 'OPEN', notes || 'Shift opened']
    );

    return res.status(201).json({
      message: 'Register shift opened successfully.',
      sessionId,
      openedBy: operatorName,
      openingFloat: floatVal
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to open register shift' });
  }
});

// POST Close Register Shift
router.post('/registers/close', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { actualCash, notes } = req.body;
    const businessId = req.body.businessId || req.businessId || 'biz-apex-retail';
    const branchId = req.body.branchId || req.branchId || 'br-apex-main';

    const db = await getDb();
    const session = await db.get(
      `SELECT * FROM register_sessions WHERE business_id = ? AND branch_id = ? AND status = 'OPEN'`,
      [businessId, branchId]
    );

    if (!session) {
      return res.status(400).json({ error: 'No active open shift register to close.' });
    }

    const expectedCash = (session.opening_float || 0) + (session.cash_sales_amount || 0) - (session.expense_amount || 0);
    const actual = Number(actualCash) !== undefined ? Number(actualCash) : expectedCash;
    const difference = actual - expectedCash;

    await db.run(
      `UPDATE register_sessions
       SET closed_at = CURRENT_TIMESTAMP, expected_cash = ?, actual_cash = ?, difference = ?, status = 'CLOSED', notes = ?
       WHERE id = ?`,
      [expectedCash, actual, difference, notes || 'Shift closed', session.id]
    );

    return res.json({
      message: 'Shift register closed successfully.',
      sessionSummary: {
        openingFloat: session.opening_float,
        cashSales: session.cash_sales_amount,
        cardSales: session.card_sales_amount,
        expenses: session.expense_amount,
        expectedCash,
        actualCash: actual,
        discrepancy: difference,
        status: 'CLOSED'
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to close register shift' });
  }
});

export default router;
