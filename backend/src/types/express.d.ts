import type { Role } from '../utils/constants';

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      email: string;
      name: string;
      role: Role;
      isActive: boolean;
    }

    interface Request {
      user?: AuthUser;
      rawBody?: Buffer;
      validated?: {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };
    }
  }
}

export {};
