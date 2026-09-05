import express from 'express';
import {
  getAnalyticAccounts,
  createAnalyticAccount,
  updateAnalyticAccount,
  archiveAnalyticAccount,
} from '../controllers/analyticController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getAnalyticAccounts)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createAnalyticAccount);

router.route('/:id')
  .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), updateAnalyticAccount);

router.patch('/:id/archive', authorizeRoles('ADMIN'), archiveAnalyticAccount);

export default router;
