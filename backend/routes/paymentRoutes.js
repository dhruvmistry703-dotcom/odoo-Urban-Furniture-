import express from 'express';
import {
  getPayments,
  getPaymentById,
  createPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT', 'CONTACT'), getPayments)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT', 'CONTACT'), createPayment);

router.route('/:id')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT', 'CONTACT'), getPaymentById);

export default router;
