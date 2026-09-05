import express from 'express';
import {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  confirmSalesOrder,
  cancelSalesOrder,
} from '../controllers/salesController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('ADMIN', 'ACCOUNTANT'));

router.route('/')
  .get(getSalesOrders)
  .post(createSalesOrder);

router.route('/:id')
  .get(getSalesOrderById)
  .put(updateSalesOrder);

router.post('/:id/confirm', confirmSalesOrder);
router.post('/:id/cancel', cancelSalesOrder);

export default router;
