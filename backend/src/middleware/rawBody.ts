import express, { type NextFunction, type Request, type Response } from 'express';

/**
 * Parses the request body as a raw Buffer. Registered on the PayMe callback
 * path *before* express.json() so the exact bytes are available for signature
 * verification. body-parser marks the request as parsed, so the later JSON
 * parser will skip it.
 */
export const callbackRawParser = express.raw({ type: () => true, limit: '1mb' });

/** Exposes the raw bytes on req.rawBody for signature verification. */
export function captureRawBody(req: Request, _res: Response, next: NextFunction): void {
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body;
  }
  next();
}
