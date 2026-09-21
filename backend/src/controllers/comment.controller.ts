import type { Request, Response } from 'express';
import * as commentService from '../services/comment.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import type { CreateCommentInput, UpdateCommentInput } from '../validators/comment.validator';

export const listPublic = asyncHandler(async (_req: Request, res: Response) => {
  const comments = await commentService.listPublicComments();
  return sendSuccess(res, comments);
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const comments = await commentService.listComments();
  return sendSuccess(res, comments);
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const body = req.validated?.body as CreateCommentInput;
  const comment = await commentService.createComment(body);
  return sendSuccess(res, comment, 201);
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string };
  const body = req.validated?.body as UpdateCommentInput;
  const comment = await commentService.updateComment(params.id, body);
  return sendSuccess(res, comment);
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const params = req.validated?.params as { id: string };
  await commentService.deleteComment(params.id);
  return sendSuccess(res, { id: params.id, deleted: true });
});
