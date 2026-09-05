import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  archiveProduct,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getProducts)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createProduct);

router.route('/:id')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getProductById)
  .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), updateProduct);

router.patch('/:id/archive', authorizeRoles('ADMIN'), archiveProduct);

export default router;
