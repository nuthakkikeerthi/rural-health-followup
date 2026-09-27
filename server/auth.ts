import type { Request, Response, NextFunction } from 'express';
import { DEMO_USERS } from './sampleDataset.ts';
import type { User, UserRole } from './types.ts';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const roleHeader = (req.headers['x-user-role'] as string) || '';
  const userIdHeader = (req.headers['x-user-id'] as string) || '';

  // Default to ASHA Worker for smooth initial session or find matched user
  let matchedUser = DEMO_USERS.find(u => u.id === userIdHeader || u.role === roleHeader);
  if (!matchedUser) {
    matchedUser = DEMO_USERS[0]; // Default to Sunita Devi (ASHA)
  }

  req.user = matchedUser;
  next();
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No active user session.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' lacks permission for this resource. Required: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}
