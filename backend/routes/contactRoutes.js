import express from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  archiveContact,
} from '../controllers/contactController.js';
import { optionalProtect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(optionalProtect);

router.route('/')
  .get(getContacts)
  .post(authorizeRoles('ADMIN'), createContact);

router.route('/:id')
  .get(getContactById)
  .put(authorizeRoles('ADMIN'), updateContact);

// Archive route - ADMIN only
router.patch('/:id/archive', authorizeRoles('ADMIN'), archiveContact);

export default router;
