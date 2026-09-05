import express from 'express';
import {
  getAccounts,
  createAccount,
  updateAccount,
  archiveAccount,
} from '../controllers/accountController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';
import Account from '../models/Account.js';

const router = express.Router();

router.use(optionalProtect);

router.route('/')
  .get(getAccounts)
  .post(createAccount);

router.route('/:id')
  .get(async (req, res, next) => {
    try {
      const account = await Account.findById(req.params.id);
      if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
      res.status(200).json({ success: true, account });
    } catch (e) {
      next(e);
    }
  })
  .put(updateAccount);

router.patch('/:id/archive', archiveAccount);

export default router;
