import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT', 'CONTACT'), getInvoices)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createInvoice);

router.route('/:id')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT', 'CONTACT'), getInvoiceById)
  .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), updateInvoice);

export default router;
