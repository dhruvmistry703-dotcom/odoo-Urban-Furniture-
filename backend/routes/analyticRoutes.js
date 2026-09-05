import express from 'express';
import {
  getAnalyticAccounts,
  getAnalyticAccountById,
  createAnalyticAccount,
  updateAnalyticAccount,
  archiveAnalyticAccount,
  deleteAnalyticAccount,
  getAnalyticAccountBudgets,
} from '../controllers/analyticController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getAnalyticAccounts)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createAnalyticAccount);

router.route('/:id')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getAnalyticAccountById)
  .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), updateAnalyticAccount)
  .delete(authorizeRoles('ADMIN', 'ACCOUNTANT'), deleteAnalyticAccount);

router.get('/:id/budgets', authorizeRoles('ADMIN', 'ACCOUNTANT'), getAnalyticAccountBudgets);
router.patch('/:id/archive', authorizeRoles('ADMIN'), archiveAnalyticAccount);

export default router;
