import express from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  confirmPurchaseOrder,
  cancelPurchaseOrder,
} from '../controllers/purchaseController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('ADMIN', 'ACCOUNTANT'));

router.route('/')
  .get(getPurchaseOrders)
  .post(createPurchaseOrder);

router.route('/:id')
  .get(getPurchaseOrderById)
  .put(updatePurchaseOrder);

router.post('/:id/confirm', confirmPurchaseOrder);
router.post('/:id/cancel', cancelPurchaseOrder);

export default router;
