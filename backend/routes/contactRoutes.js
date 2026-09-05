import express from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  archiveContact,
} from '../controllers/contactController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getContacts)
  .post(authorizeRoles('ADMIN', 'ACCOUNTANT'), createContact);

router.route('/:id')
  .get(authorizeRoles('ADMIN', 'ACCOUNTANT'), getContactById)
  .put(authorizeRoles('ADMIN', 'ACCOUNTANT'), updateContact);

// Archive is strictly ADMIN only
router.patch('/:id/archive', authorizeRoles('ADMIN'), archiveContact);

export default router;
