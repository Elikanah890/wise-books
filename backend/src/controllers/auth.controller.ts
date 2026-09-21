import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import type {
  ChangePasswordInput,
  LoginInput,
  UpdateProfileInput,
} from '../validators/auth.validator';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validated?.body as LoginInput;
  const result = await authService.login(body);
  return sendSuccess(res, result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  const user = await authService.getMe(req.user.id);
  return sendSuccess(res, user);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  const body = req.validated?.body as UpdateProfileInput;
  const user = await authService.updateProfile(req.user.id, body);
  return sendSuccess(res, user);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  const body = req.validated?.body as ChangePasswordInput;
  await authService.changePassword(req.user.id, body);
  return sendSuccess(res, { changed: true });
});
