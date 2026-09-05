import express from 'express';
import {
  getJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  updateJournalEntry,
  postJournalEntry,
  cancelJournalEntry,
} from '../controllers/journalEntryController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(optionalProtect);

router.route('/')
  .get(getJournalEntries)
  .post(createJournalEntry);

router.route('/:id')
  .get(getJournalEntryById)
  .put(updateJournalEntry);

router.patch('/:id/post', postJournalEntry);
router.patch('/:id/cancel', cancelJournalEntry);

export default router;
