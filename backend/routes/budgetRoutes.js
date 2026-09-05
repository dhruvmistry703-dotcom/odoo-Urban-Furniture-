import express from 'express';
import {
  getBudgets,
  createBudget,
  updateBudget,
  archiveBudget,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getBudgets)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createBudget);

router.route('/:id')
  .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), updateBudget);

router.patch('/:id/archive', authorizeRoles('ADMIN'), archiveBudget);

export default router;
