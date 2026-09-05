import express from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  convertSOToInvoice,
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getInvoices)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createInvoice);

router.post('/from-so/:soId', authorizeRoles('ADMIN', 'ACCOUNTANT'), convertSOToInvoice);

router.route('/:id')
  .get(getInvoiceById)
  .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), updateInvoice);

export default router;
