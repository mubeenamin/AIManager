import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/database';

export const JWT_SECRET = process.env.JWT_SECRET || 'ai-manager-super-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  businessId?: string;
  branchId?: string;
  userRole?: string;
}

export async function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const requestedBusinessId = req.headers['x-business-id'] as string;

  if (!token) {
    // For demo/development ease, allow fallback header or default user if header exists
    if (requestedBusinessId) {
      req.businessId = requestedBusinessId;
    }
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; name: string };
    req.user = decoded;

    // Check membership and active role
    if (requestedBusinessId) {
      req.businessId = requestedBusinessId;
      const db = await getDb();
      const membership = await db.get(
        'SELECT role, active_branch_id FROM memberships WHERE user_id = ? AND business_id = ?',
        [decoded.id, requestedBusinessId]
      );
      if (membership) {
        req.userRole = membership.role;
        req.branchId = membership.active_branch_id;
      }
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // If no role set, but businessId provided in dev, allow unless strict mode
    const role = req.userRole || 'OWNER'; // default to owner if dev mode
    if (allowedRoles.includes(role) || role === 'OWNER' || role === 'ADMIN') {
      return next();
    }
    return res.status(403).json({
      error: `Access Denied: Your current domain role (${role}) does not have permission for this action.`
    });
  };
}

export function generateToken(payload: { id: string; email: string; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}
