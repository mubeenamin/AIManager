import { Router, Response } from 'express';
import { getDb } from '../db/database';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';

const router = Router();

// GET Expenses
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const businessId = (req.query.businessId as string) || req.businessId || 'biz-apex-retail';
    const db = await getDb();
    const expenses = await db.all('SELECT * FROM expenses WHERE business_id = ? ORDER BY expense_date DESC', [businessId]);

    const mapped = expenses.map((e) => ({
      id: e.id,
      businessId: e.business_id,
      branchId: e.branch_id,
      category: e.category,
      title: e.title,
      amount: e.amount,
      paymentMethod: e.payment_method,
      notes: e.notes,
      expenseDate: e.expense_date,
      createdBy: e.created_by
    }));

    return res.json(mapped);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST Expense Voucher
router.post('/', requireRole(['OWNER', 'SUPERVISOR', 'ACCOUNTANT', 'MANAGER']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, amount, paymentMethod, notes, branchId } = req.body;
    const businessId = req.body.businessId || req.businessId || 'biz-apex-retail';
    const activeBranchId = branchId || req.branchId || 'br-apex-main';

    if (!title || !category || !amount) {
      return res.status(400).json({ error: 'Title, Category, and Amount are required.' });
    }

    const expenseAmount = Number(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0.' });
    }

    const db = await getDb();
    const expenseId = `exp-${Date.now()}`;
    const operatorName = req.user?.name || 'Manager (Sarah Connor)';

    await db.run(
      `INSERT INTO expenses (id, business_id, branch_id, category, title, amount, payment_method, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [expenseId, businessId, activeBranchId, category, title, expenseAmount, paymentMethod || 'CASH', notes || '', operatorName]
    );

    // If paid in cash, update open shift register expense total
    if (paymentMethod === 'CASH') {
      const openSession = await db.get(
        `SELECT * FROM register_sessions WHERE business_id = ? AND branch_id = ? AND status = 'OPEN'`,
        [businessId, activeBranchId]
      );
      if (openSession) {
        await db.run(
          `UPDATE register_sessions SET expense_amount = expense_amount + ? WHERE id = ?`,
          [expenseAmount, openSession.id]
        );
      }
    }

    const expense = await db.get('SELECT * FROM expenses WHERE id = ?', [expenseId]);
    return res.status(201).json(expense);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to record expense' });
  }
});

export default router;
