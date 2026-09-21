import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import * as bookController from '../controllers/book.controller';
import * as categoryController from '../controllers/category.controller';
import * as settingsController from '../controllers/settings.controller';
import * as commentController from '../controllers/comment.controller';
import { admin } from '../middleware/admin';
import { auth } from '../middleware/auth';
import { coverUpload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import {
  adminBookQuerySchema,
  bookIdParamSchema,
  createBookSchema,
  imageIdParamSchema,
  reorderImagesSchema,
  updateBookSchema,
} from '../validators/book.validator';
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator';
import { orderListQuerySchema, paymentListQuerySchema } from '../validators/order.validator';
import { siteSettingsSchema } from '../validators/settings.validator';
import {
  commentIdParamSchema,
  createCommentSchema,
  updateCommentSchema,
} from '../validators/comment.validator';

const router = Router();

router.use(auth, admin);

router.get('/settings', settingsController.get);
router.put('/settings', validate({ body: siteSettingsSchema }), settingsController.update);

router.get('/comments', commentController.list);
router.post('/comments', validate({ body: createCommentSchema }), commentController.create);
router.patch(
  '/comments/:id',
  validate({ params: commentIdParamSchema, body: updateCommentSchema }),
  commentController.update
);
router.delete(
  '/comments/:id',
  validate({ params: commentIdParamSchema }),
  commentController.remove
);

router.get('/dashboard', adminController.dashboard);
router.get('/revenue', adminController.revenue);
router.get('/orders', validate({ query: orderListQuerySchema }), adminController.orders);
router.get('/payments', validate({ query: paymentListQuerySchema }), adminController.payments);

router.get('/books', validate({ query: adminBookQuerySchema }), bookController.listAdmin);
router.post('/books', validate({ body: createBookSchema }), bookController.create);
router.get('/books/:id', validate({ params: bookIdParamSchema }), bookController.getAdmin);
router.patch(
  '/books/:id',
  validate({ params: bookIdParamSchema, body: updateBookSchema }),
  bookController.update
);
router.delete(
  '/books/:id',
  validate({ params: bookIdParamSchema }),
  bookController.remove
);

router.post(
  '/books/:id/images',
  validate({ params: bookIdParamSchema }),
  coverUpload.array('images', 10),
  bookController.addImages
);
router.patch(
  '/books/:id/images/reorder',
  validate({ params: bookIdParamSchema, body: reorderImagesSchema }),
  bookController.reorderImages
);
router.patch(
  '/books/:id/images/:imageId/primary',
  validate({ params: imageIdParamSchema }),
  bookController.setPrimaryImage
);
router.delete(
  '/books/:id/images/:imageId',
  validate({ params: imageIdParamSchema }),
  bookController.deleteImage
);

router.get('/categories', categoryController.list);
router.post(
  '/categories',
  validate({ body: createCategorySchema }),
  categoryController.create
);
router.patch(
  '/categories/:id',
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  categoryController.update
);
router.delete(
  '/categories/:id',
  validate({ params: categoryIdParamSchema }),
  categoryController.remove
);

export default router;
