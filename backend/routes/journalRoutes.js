import express from 'express';
import {
  getJournals,
  createJournal,
  updateJournal,
  archiveJournal,
} from '../controllers/journalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getJournals)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createJournal);

router.route('/:id')
  .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), updateJournal);

router.patch('/:id/archive', authorizeRoles('ADMIN'), archiveJournal);

export default router;
