import express from 'express';
import {
  getAccounts,
  createAccount,
  updateAccount,
  archiveAccount,
} from '../controllers/accountController.js';
import { protect, optionalProtect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(optionalProtect);

router.route('/')
  .get(getAccounts)
  .post(createAccount);

router.route('/:id')
  .put(updateAccount);

router.patch('/:id/archive', archiveAccount);

export default router;
