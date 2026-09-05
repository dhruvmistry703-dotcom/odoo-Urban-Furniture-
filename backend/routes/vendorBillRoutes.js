import express from 'express';
import {
  getVendorBills,
  getVendorBillById,
  createVendorBill,
} from '../controllers/vendorBillController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT', 'CONTACT'), getVendorBills)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createVendorBill);

router.route('/:id')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT', 'CONTACT'), getVendorBillById);

export default router;
