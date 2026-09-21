import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { AppError } from '../utils/AppError';

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated: Request['validated'] = {};
      if (schemas.body) {
        validated.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        validated.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        validated.params = schemas.params.parse(req.params);
      }
      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // A field-level refinement can request a specific error code/message
        // (e.g. INVALID_PHONE) via issue.params.errorCode.
        const coded = error.issues.find(
          (issue) =>
            (issue as unknown as { params?: { errorCode?: string } }).params?.errorCode
        ) as unknown as { params?: { errorCode?: string }; message: string } | undefined;

        next(
          new AppError(
            400,
            coded?.params?.errorCode ?? 'VALIDATION_ERROR',
            coded?.message ?? 'Request validation failed',
            error.issues.map((issue) => ({
              path: issue.path.join('.'),
              message: issue.message,
            }))
          )
        );
        return;
      }
      next(error);
    }
  };
}
