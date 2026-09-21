import { Router } from 'express';
import * as bookController from '../controllers/book.controller';
import * as categoryController from '../controllers/category.controller';
import * as downloadController from '../controllers/download.controller';
import * as orderController from '../controllers/order.controller';
import * as paymentController from '../controllers/payment.controller';
import * as settingsController from '../controllers/settings.controller';
import * as commentController from '../controllers/comment.controller';
import { prisma } from '../lib/prisma';
import { paymentLimiter, orderLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { bookIdParamSchema, publicBookQuerySchema } from '../validators/book.validator';
import { createOrderSchema, orderIdParamSchema } from '../validators/order.validator';
import { initiatePaymentSchema } from '../validators/payment.validator';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    return sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() });
  })
);

router.get('/settings', settingsController.get);
router.get('/comments', commentController.listPublic);

router.get('/books', validate({ query: publicBookQuerySchema }), bookController.listPublic);
router.get('/books/:id', validate({ params: bookIdParamSchema }), bookController.getPublic);
router.get('/categories', categoryController.list);

router.post(
  '/orders',
  orderLimiter,
  validate({ body: createOrderSchema }),
  orderController.create
);
router.get(
  '/orders/:id/status',
  validate({ params: orderIdParamSchema }),
  orderController.status
);

router.post(
  '/payments/selcom/initiate',
  paymentLimiter,
  validate({ body: initiatePaymentSchema }),
  paymentController.initiate
);

// Signature-verified webhook (no JWT). Raw body is captured in app.ts.
router.post('/payments/selcom/callback', paymentController.callback);

router.get('/download/:token', downloadController.resolve);

export default router;
