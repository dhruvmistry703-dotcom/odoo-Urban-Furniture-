import express from 'express';
import {
  getVendorBills,
  getVendorBillById,
  createVendorBill,
  convertPOToVendorBill,
} from '../controllers/vendorBillController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getVendorBills)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createVendorBill);

router.post('/from-po/:poId', authorizeRoles('ADMIN', 'ACCOUNTANT'), convertPOToVendorBill);

router.route('/:id')
  .get(getVendorBillById);

export default router;
