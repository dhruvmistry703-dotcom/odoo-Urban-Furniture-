export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before accessing this resource',
      });
    }

    const userRole = String(req.user.role).toUpperCase();
    const allowed = allowedRoles.map(r => String(r).toUpperCase());

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role [${req.user.role}] does not have permission to perform this action.`,
      });
    }

    next();
  };
};
