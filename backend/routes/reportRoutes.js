import express from 'express';
import {
  getProfitLoss,
  getBalanceSheet,
  getBudgetReport,
  getLedger,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('ADMIN', 'ACCOUNTANT', 'CONTACT'));

router.get('/profit-loss', getProfitLoss);
router.get('/balance-sheet', getBalanceSheet);
router.get('/budget', getBudgetReport);
router.get('/ledger', getLedger);

export default router;
