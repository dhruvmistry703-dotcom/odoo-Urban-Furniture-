import Contact from '../models/Contact.js';
import User from '../models/User.js';

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Protected (ADMIN, ACCOUNTANT)
export const getContacts = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single contact by ID
// @route   GET /api/contacts/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    // Also check if there is a linked user
    const linkedUser = await User.findOne({ contactId: contact._id }).select('name email role isActive');

    res.status(200).json({
      success: true,
      contact,
      linkedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create contact (with optional user account)
// @route   POST /api/contacts
// @access  Protected (ADMIN, ACCOUNTANT)
export const createContact = async (req, res, next) => {
  try {
    const {
      name,
      type,
      email,
      phone,
      address,
      street,
      city,
      state,
      country,
      pincode,
      image,
      taxId,
      createLoginAccount,
      password,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Contact name is required',
      });
    }

    const computedAddress = address || [street, city, state, pincode, country].filter(Boolean).join(', ');

    const contact = await Contact.create({
      name,
      type: type || 'customer',
      email: email || '',
      phone: phone || '',
      address: computedAddress,
      street: street || '',
      city: city || '',
      state: state || '',
      country: country || 'India',
      pincode: pincode || '',
      image: image || '',
      taxId: taxId || '',
      status: 'active',
      totalInvoiced: 0,
      totalPaid: 0,
      outstanding: 0,
    });

    let createdUser = null;
    if (createLoginAccount && email && password) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (!userExists) {
        createdUser = await User.create({
          name,
          email: email.toLowerCase(),
          password,
          role: 'CONTACT',
          contactId: contact._id,
          isActive: true,
        });
      }
    }

    res.status(201).json({
      success: true,
      contact,
      createdUser: createdUser ? { id: createdUser._id, email: createdUser.email, role: createdUser.role } : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact
// @route   PUT /api/contacts/:id
// @access  Protected (ADMIN, ACCOUNTANT)
export const updateContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    // Check if status is being set to archived by non-admin
    if (req.body.status === 'archived' && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators have permission to archive contacts',
      });
    }

    const updatedContact = await Contact.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      contact: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive contact
// @route   PATCH /api/contacts/:id/archive
// @access  Protected (ADMIN only)
export const archiveContact = async (req, res, next) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only Administrators have permission to archive contacts',
      });
    }

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    contact.status = contact.status === 'archived' ? 'active' : 'archived';
    await contact.save();

    res.status(200).json({
      success: true,
      message: `Contact ${contact.status === 'archived' ? 'archived' : 'unarchived'} successfully`,
      contact,
    });
  } catch (error) {
    next(error);
  }
};
