import { Router } from 'express';
import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';
import publicRoutes from './public.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/', publicRoutes);

export default router;
