import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  archiveProduct,
  getProductCategories,
} from '../controllers/productController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(optionalProtect);

// Categories route before /:id
router.get('/categories', getProductCategories);

router.route('/')
  .get(getProducts)
  .post(createProduct);

router.route('/:id')
  .get(getProductById)
  .put(updateProduct);

router.patch('/:id/archive', archiveProduct);

export default router;
