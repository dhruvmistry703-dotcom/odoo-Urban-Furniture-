import express from 'express';
import {
  getBudgets,
  getBudgetById,
  getBudgetTransactions,
  createBudget,
  updateBudget,
  confirmBudget,
  reviseBudget,
  cancelBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getBudgets)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createBudget);

router.route('/:id')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getBudgetById)
  .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), updateBudget)
  .delete(authorizeRoles('ADMIN', 'ACCOUNTANT'), deleteBudget);

router.get('/:id/transactions', authorizeRoles('ADMIN', 'ACCOUNTANT'), getBudgetTransactions);
router.patch('/:id/confirm', authorizeRoles('ADMIN', 'ACCOUNTANT'), confirmBudget);
router.post('/:id/revise', authorizeRoles('ADMIN', 'ACCOUNTANT'), reviseBudget);
router.patch('/:id/cancel', authorizeRoles('ADMIN', 'ACCOUNTANT'), cancelBudget);

export default router;
