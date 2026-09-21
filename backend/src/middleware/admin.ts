import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { ROLE } from '../utils/constants';

export function admin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    return;
  }
  if (req.user.role !== ROLE.ADMIN) {
    next(new AppError(403, 'FORBIDDEN', 'Administrator access required'));
    return;
  }
  next();
}
