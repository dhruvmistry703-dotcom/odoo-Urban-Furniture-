import express from 'express';
import {
  getAccounts,
  createAccount,
  updateAccount,
  archiveAccount,
} from '../controllers/accountController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getAccounts)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createAccount);

router.route('/:id')
  .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), updateAccount);

router.patch('/:id/archive', authorizeRoles('ADMIN'), archiveAccount);

export default router;
