import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database';
import { AuthenticatedRequest, requireRole } from '../middleware/auth';

const router = Router();

// Get list of all business profiles (or active business)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const db = await getDb();
    const businesses = await db.all('SELECT * FROM businesses ORDER BY created_at DESC');

    for (const b of businesses) {
      const branches = await db.all('SELECT * FROM branches WHERE business_id = ?', [b.id]);
      b.branches = branches;
    }

    return res.json(businesses);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get Company Profile Details & Domain Users List
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();

    const business = await db.get('SELECT * FROM businesses WHERE id = ?', [id]);
    if (!business) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const branches = await db.all('SELECT * FROM branches WHERE business_id = ?', [id]);
    const members = await db.all(
      `SELECT m.id as membership_id, m.role, m.active_branch_id, u.id as user_id, u.name, u.email, u.phone
       FROM memberships m
       JOIN users u ON m.user_id = u.id
       WHERE m.business_id = ?`,
      [id]
    );

    return res.json({
      ...business,
      branches,
      members
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

// Create / Add Domain User to Company (Owner or Supervisor permission)
router.post('/users', requireRole(['OWNER', 'ADMIN', 'SUPERVISOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { businessId, name, email, password, role, branchId, phone } = req.body;
    const targetBusinessId = businessId || req.businessId;

    if (!targetBusinessId || !name || !email || !role) {
      return res.status(400).json({ error: 'Business ID, Name, Email, and Domain Role are required.' });
    }

    const validRoles = ['OWNER', 'ADMIN', 'SUPERVISOR', 'CASHIER', 'INVENTORY_MANAGER', 'ACCOUNTANT', 'STAFF'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: `Invalid domain role. Must be one of: ${validRoles.join(', ')}` });
    }

    const db = await getDb();

    // Check if user already exists
    let existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    let userId = existingUser?.id;

    if (!existingUser) {
      userId = `usr-${Date.now()}`;
      const defaultPassword = password || 'password123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      await db.run(
        `INSERT INTO users (id, name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)`,
        [userId, name, email, passwordHash, phone || '']
      );
    }

    // Check if membership already exists
    const existingMembership = await db.get(
      'SELECT * FROM memberships WHERE user_id = ? AND business_id = ?',
      [userId, targetBusinessId]
    );

    if (existingMembership) {
      // Update role
      await db.run(
        'UPDATE memberships SET role = ?, active_branch_id = ? WHERE id = ?',
        [role, branchId || existingMembership.active_branch_id, existingMembership.id]
      );
    } else {
      // Create new membership
      const membershipId = `mem-${Date.now()}`;
      await db.run(
        'INSERT INTO memberships (id, user_id, business_id, role, active_branch_id) VALUES (?, ?, ?, ?, ?)',
        [membershipId, userId, targetBusinessId, role, branchId || '']
      );
    }

    return res.status(201).json({
      message: `Domain user ${name} assigned as ${role} successfully.`,
      user: { id: userId, name, email, role, businessId: targetBusinessId }
    });
  } catch (error: any) {
    console.error('Error adding domain user:', error);
    return res.status(500).json({ error: error.message || 'Failed to add domain user' });
  }
});

// Create Branch
router.post('/branches', requireRole(['OWNER', 'ADMIN', 'SUPERVISOR']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { businessId, name, code, phone, address } = req.body;
    const targetBusinessId = businessId || req.businessId;

    if (!targetBusinessId || !name || !code) {
      return res.status(400).json({ error: 'Business ID, Branch Name, and Code are required.' });
    }

    const db = await getDb();
    const branchId = `br-${Date.now()}`;

    await db.run(
      'INSERT INTO branches (id, business_id, name, code, phone, address) VALUES (?, ?, ?, ?, ?, ?)',
      [branchId, targetBusinessId, name, code, phone || '', address || '']
    );

    const branch = await db.get('SELECT * FROM branches WHERE id = ?', [branchId]);
    return res.status(201).json(branch);
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to create branch' });
  }
});

export default router;
