import type { Request, Response } from 'express';
import * as downloadService from '../services/download.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

export const resolve = asyncHandler(async (req: Request, res: Response) => {
  const params = req.params as { token: string };
  const result = await downloadService.resolveDownload(params.token);
  return sendSuccess(res, result);
});
