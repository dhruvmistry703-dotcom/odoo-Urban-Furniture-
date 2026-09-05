import express from 'express';
import {
  getJournals,
  createJournal,
  updateJournal,
  archiveJournal,
} from '../controllers/journalController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(optionalProtect);

router.route('/')
  .get(getJournals)
  .post(createJournal);

router.route('/:id')
  .put(updateJournal);

router.patch('/:id/archive', archiveJournal);

export default router;
