import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/database';
import { generateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Register Company & Owner Account
router.post('/register-company', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { companyName, businessType, currency, currencySymbol, ownerName, ownerEmail, ownerPassword, phone, address } = req.body;

    if (!companyName || !ownerEmail || !ownerPassword || !ownerName) {
      return res.status(400).json({ error: 'Company Name, Owner Name, Email, and Password are required.' });
    }

    const db = await getDb();

    // Check if user email already registered
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [ownerEmail]);
    let userId = existingUser?.id;

    if (!existingUser) {
      userId = `usr-${Date.now()}`;
      const passwordHash = await bcrypt.hash(ownerPassword, 10);
      await db.run(
        `INSERT INTO users (id, name, email, password_hash, phone) VALUES (?, ?, ?, ?, ?)`,
        [userId, ownerName, ownerEmail, passwordHash, phone || '']
      );
    }

    // Create Business Profile
    const businessId = `biz-${Date.now()}`;
    await db.run(
      `INSERT INTO businesses (id, name, legal_name, business_type, currency, currency_symbol, phone, email, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        businessId,
        companyName,
        companyName,
        businessType || 'RETAIL',
        currency || 'USD',
        currencySymbol || '$',
        phone || '',
        ownerEmail,
        address || ''
      ]
    );

    // Create Default Branch
    const branchId = `br-${Date.now()}`;
    await db.run(
      `INSERT INTO branches (id, business_id, name, code, phone, address) VALUES (?, ?, ?, ?, ?, ?)`,
      [branchId, businessId, 'Main Branch', 'BR-01', phone || '', address || 'Primary Location']
    );

    // Assign OWNER membership
    const membershipId = `mem-${Date.now()}`;
    await db.run(
      `INSERT INTO memberships (id, user_id, business_id, role, active_branch_id) VALUES (?, ?, ?, ?, ?)`,
      [membershipId, userId, businessId, 'OWNER', branchId]
    );

    // Seed default categories
    const defaultCat1 = `cat-${Date.now()}-1`;
    const defaultCat2 = `cat-${Date.now()}-2`;
    await db.run(
      `INSERT INTO categories (id, business_id, name, description) VALUES (?, ?, ?, ?)`,
      [defaultCat1, businessId, 'General Merchandise', 'Default catalog category']
    );
    await db.run(
      `INSERT INTO categories (id, business_id, name, description) VALUES (?, ?, ?, ?)`,
      [defaultCat2, businessId, 'Services & Others', 'Misc services and items']
    );

    // Generate Auth Token
    const user = { id: userId!, email: ownerEmail, name: ownerName };
    const token = generateToken(user);

    const business = await db.get('SELECT * FROM businesses WHERE id = ?', [businessId]);
    const branches = await db.all('SELECT * FROM branches WHERE business_id = ?', [businessId]);
    business.branches = branches;

    return res.status(201).json({
      message: 'Company Profile & Owner Account registered successfully!',
      token,
      user,
      business,
      role: 'OWNER'
    });
  } catch (error: any) {
    console.error('Error in /register-company:', error);
    return res.status(500).json({ error: error.message || 'Failed to register company' });
  }
});

// User Login
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = await getDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Fetch user memberships and business profiles
    const memberships = await db.all(
      `SELECT m.id, m.business_id, m.role, m.active_branch_id, b.name as business_name, b.business_type, b.currency, b.currency_symbol
       FROM memberships m
       JOIN businesses b ON m.business_id = b.id
       WHERE m.user_id = ?`,
      [user.id]
    );

    const token = generateToken({ id: user.id, email: user.email, name: user.name });

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatar_url },
      memberships
    });
  } catch (error: any) {
    console.error('Error in /login:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Get Current Profile
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const db = await getDb();
    const user = await db.get('SELECT id, name, email, phone, avatar_url FROM users WHERE id = ?', [req.user.id]);
    
    const memberships = await db.all(
      `SELECT m.id, m.business_id, m.role, m.active_branch_id, b.name as business_name, b.business_type, b.currency, b.currency_symbol
       FROM memberships m
       JOIN businesses b ON m.business_id = b.id
       WHERE m.user_id = ?`,
      [user.id]
    );

    return res.json({ user, memberships });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;
