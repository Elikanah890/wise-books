import type { Request, Response } from 'express';
import * as categoryService from '../services/category.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../validators/category.validator';

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const result = await categoryService.listCategories();
  return sendSuccess(res, result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validated?.body as CreateCategoryInput;
  const result = await categoryService.createCategory(body);
  return sendSuccess(res, result, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string };
  const body = req.validated?.body as UpdateCategoryInput;
  const result = await categoryService.updateCategory(params.id, body);
  return sendSuccess(res, result);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string };
  await categoryService.deleteCategory(params.id);
  return sendSuccess(res, { id: params.id, deleted: true });
});
