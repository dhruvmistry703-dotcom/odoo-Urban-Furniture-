import express from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  archiveContact,
} from '../controllers/contactController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(optionalProtect);

router.route('/')
  .get(getContacts)
  .post(createContact);

router.route('/:id')
  .get(getContactById)
  .put(updateContact);

// Archive route
router.patch('/:id/archive', archiveContact);

export default router;
