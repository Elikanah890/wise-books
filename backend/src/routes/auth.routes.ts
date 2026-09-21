import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { admin } from '../middleware/admin';
import { auth } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import {
  changePasswordSchema,
  loginSchema,
  updateProfileSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/login', loginLimiter, validate({ body: loginSchema }), authController.login);
router.get('/me', auth, admin, authController.me);
router.patch(
  '/profile',
  auth,
  admin,
  validate({ body: updateProfileSchema }),
  authController.updateProfile
);
router.post(
  '/change-password',
  auth,
  admin,
  validate({ body: changePasswordSchema }),
  authController.changePassword
);

export default router;
