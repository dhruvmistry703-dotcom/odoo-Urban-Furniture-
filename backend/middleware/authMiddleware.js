import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Contact from '../models/Contact.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Read JWT from Authorization header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, authentication token is missing',
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    // 2. Verify JWT
    const decoded = jwt.verify(token, jwtSecret);

    // 3. Find user in database to verify existence and active status
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists',
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account has been deactivated. Please contact an administrator.',
      });
    }

    // Smart Contact resolution if user role is CONTACT but contactId was not saved
    let contactId = user.contactId ? user.contactId.toString() : null;
    if (user.role === 'CONTACT' && !contactId && user.email) {
      try {
        const matchedContact = await Contact.findOne({ email: user.email.toLowerCase() });
        if (matchedContact) {
          contactId = matchedContact._id.toString();
          user.contactId = matchedContact._id;
          await user.save();
        }
      } catch (e) {
        console.error('Error auto-linking contact in protect middleware:', e.message);
      }
    }

    // 4. Attach authenticated user details to req.user
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      contactId: contactId,
    };

    next();
  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid or expired',
    });
  }
};
