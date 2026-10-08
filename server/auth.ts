import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { loadDatabase } from './db.js';
import { User } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'muslim_pro_secure_jwt_secret_change_in_production';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Authentication token is required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const db = loadDatabase();
    const user = db.users.find(u => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists' });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ error: 'Account has been disabled by an administrator' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const db = loadDatabase();
    const user = db.users.find(u => u.id === decoded.id);
    if (user && user.status === 'active') {
      req.user = user;
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  verifyAuth(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin privilege required' });
    }
    next();
  });
}
