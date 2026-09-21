import type { NextFunction, Request, Response } from 'express';
import { MulterError } from 'multer';
import { Prisma } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../lib/logger';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/response';

export function notFoundHandler(_req: Request, res: Response): void {
  sendError(res, 404, 'NOT_FOUND', 'Resource not found');
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AppError) {
    sendError(res, error.statusCode, error.code, error.message, error.details);
    return;
  }

  if (error instanceof MulterError) {
    const message =
      error.code === 'LIMIT_FILE_SIZE'
        ? `File exceeds the maximum size of ${env.MAX_FILE_SIZE_MB} MB`
        : error.message;
    sendError(res, 400, 'UPLOAD_ERROR', message);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      sendError(res, 409, 'CONFLICT', 'A record with these values already exists');
      return;
    }
    if (error.code === 'P2003' || error.code === 'P2014') {
      sendError(res, 409, 'FK_CONSTRAINT', 'Operation violates a related record constraint');
      return;
    }
    if (error.code === 'P2025') {
      sendError(res, 404, 'NOT_FOUND', 'Resource not found');
      return;
    }
  }

  logger.error({ err: error }, 'Unhandled error');
  sendError(res, 500, 'INTERNAL_ERROR', 'Something went wrong');
}
