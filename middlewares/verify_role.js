const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.userRole) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden!',
      });
    }

    const uRole = Array.isArray(req.userRole) ? req.userRole : [req.userRole];
    const result = uRole
      .map((userRole) => allowedRoles.includes(userRole))
      .find((val) => val === true);
    if (!result) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden!',
      });
    }
    next();
  };
};

module.exports = verifyRoles;
