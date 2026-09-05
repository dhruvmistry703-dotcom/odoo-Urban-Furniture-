import User from '../models/User.js';
import Contact from '../models/Contact.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Protected (ADMIN only)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').populate('contactId', 'name email phone type');
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Protected (ADMIN only)
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('contactId');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Protected (ADMIN only)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, contactId, isActive } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    const userRole = role ? role.toUpperCase() : 'ACCOUNTANT';
    let resolvedContactId = contactId || null;

    if (userRole === 'CONTACT' && !resolvedContactId) {
      const matchedContact = await Contact.findOne({ email: email.toLowerCase() });
      if (matchedContact) {
        resolvedContactId = matchedContact._id;
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      contactId: userRole === 'CONTACT' ? resolvedContactId : null,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactId: user.contactId,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Protected (ADMIN only)
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const { name, email, role, contactId, isActive, password } = req.body;

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role.toUpperCase();
    if (contactId !== undefined) user.contactId = contactId || null;
    if (isActive !== undefined) user.isActive = isActive;
    if (password) user.password = password;

    if (user.role === 'CONTACT' && !user.contactId) {
      const matchedContact = await Contact.findOne({ email: user.email.toLowerCase() });
      if (matchedContact) {
        user.contactId = matchedContact._id;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactId: user.contactId,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/status
// @access  Protected (ADMIN only)
export const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deactivating own self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account',
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};
