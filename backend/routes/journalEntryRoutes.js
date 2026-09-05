import express from 'express';
import {
  getJournalEntries,
  getJournalEntryById,
  createJournalEntry,
} from '../controllers/journalEntryController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('ADMIN', 'ACCOUNTANT'));

router.route('/')
  .get(getJournalEntries)
  .post(createJournalEntry);

router.route('/:id')
  .get(getJournalEntryById);

export default router;
