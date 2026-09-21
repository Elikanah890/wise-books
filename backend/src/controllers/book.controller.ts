import type { Request, Response } from 'express';
import * as bookService from '../services/book.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import type {
  AdminBookQuery,
  CreateBookInput,
  PublicBookQuery,
  ReorderImagesInput,
  UpdateBookInput,
} from '../validators/book.validator';

export const listPublic = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validated?.query as PublicBookQuery;
  const result = await bookService.listPublicBooks(query);
  return sendSuccess(res, result);
});

export const getPublic = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string };
  const result = await bookService.getPublicBook(params.id);
  return sendSuccess(res, result);
});

export const listAdmin = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validated?.query as AdminBookQuery;
  const result = await bookService.listAdminBooks(query);
  return sendSuccess(res, result);
});

export const getAdmin = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string };
  const result = await bookService.getAdminBook(params.id);
  return sendSuccess(res, result);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validated?.body as CreateBookInput;
  const result = await bookService.createBook(body);
  return sendSuccess(res, result, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string };
  const body = req.validated?.body as UpdateBookInput;
  const result = await bookService.updateBook(params.id, body);
  return sendSuccess(res, result);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string };
  await bookService.softDeleteBook(params.id);
  return sendSuccess(res, { id: params.id, isActive: false });
});

export const addImages = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string };
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const result = await bookService.addBookImages(params.id, files);
  return sendSuccess(res, result, 201);
});

export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string; imageId: string };
  await bookService.deleteBookImage(params.id, params.imageId);
  return sendSuccess(res, { id: params.imageId, deleted: true });
});

export const setPrimaryImage = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string; imageId: string };
  const result = await bookService.setPrimaryBookImage(params.id, params.imageId);
  return sendSuccess(res, result);
});

export const reorderImages = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string };
  const body = req.validated?.body as ReorderImagesInput;
  const result = await bookService.reorderBookImages(params.id, body);
  return sendSuccess(res, result);
});

export function ensureFilesPresent(req: Request): void {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    throw new AppError(400, 'NO_FILES', 'At least one image is required');
  }
}
