import type { Request, Response } from 'express';
import * as settingsService from '../services/settings.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import type { SiteSettingsInput } from '../validators/settings.validator';

export const get = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getSettings();
  return sendSuccess(res, settings);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validated?.body as SiteSettingsInput;
  const settings = await settingsService.updateSettings(body);
  return sendSuccess(res, settings);
});
