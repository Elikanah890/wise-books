import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { callbackLimiter, initiateLimiter, statusLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { initiatePaymentSchema, paymentIdParamSchema } from '../validators/payment.validator';

const router = Router();

router.post(
  '/payments/payme/initiate',
  initiateLimiter,
  validate({ body: initiatePaymentSchema }),
  paymentController.initiate
);

// Signature-verified webhook (no JWT). Raw body is captured in app.ts before express.json().
router.post('/payments/payme/callback', callbackLimiter, paymentController.callback);

router.get(
  '/payments/:id/status',
  statusLimiter,
  validate({ params: paymentIdParamSchema }),
  paymentController.status
);

export default router;
