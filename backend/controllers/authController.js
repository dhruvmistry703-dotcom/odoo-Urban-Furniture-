import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Contact from '../models/Contact.js';

// Helper to generate JWT
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      contactId: user.contactId || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Protected (Admin only for ADMIN/ACCOUNTANT; Admin/Accountant for CONTACT)
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, contactId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const requestedRole = role ? role.toUpperCase() : 'ACCOUNTANT';
    if (!['ADMIN', 'ACCOUNTANT', 'CONTACT'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed roles: ADMIN, ACCOUNTANT, CONTACT',
      });
    }

    // Role check: Only ADMIN can create ADMIN or ACCOUNTANT
    if (['ADMIN', 'ACCOUNTANT'].includes(requestedRole)) {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Only Administrators can create Admin or Accountant accounts',
        });
      }
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists',
      });
    }

    let resolvedContactId = contactId || null;

    // Auto-discover / link Contact master if role is CONTACT
    if (requestedRole === 'CONTACT' && !resolvedContactId) {
      const matchedContact = await Contact.findOne({ email: email.toLowerCase() });
      if (matchedContact) {
        resolvedContactId = matchedContact._id;
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: requestedRole,
      contactId: requestedRole === 'CONTACT' ? resolvedContactId : null,
      isActive: true,
    });

    const token = generateToken(user);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      token,
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

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Find user with password selected
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    // Smart resolution if contactId is missing for CONTACT role
    if (user.role === 'CONTACT' && !user.contactId) {
      const matchedContact = await Contact.findOne({ email: email.toLowerCase() });
      if (matchedContact) {
        user.contactId = matchedContact._id;
        await user.save();
      }
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      token,
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

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Protected
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('contactId');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contactId: user.contactId ? (user.contactId._id || user.contactId) : null,
        contactDetails: user.contactId || null,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
