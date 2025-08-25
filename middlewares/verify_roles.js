

const verifyRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req?.userRole) return res.status(401).json({
            success: false,
            message: "Unauthorized!",
        });

        const rolesArray = [...allowedRoles];
        const uRole = !Array.isArray(req.userRole) ? [req.userRole] : req.userRole;
        const result = uRole.map(userRole => rolesArray.includes(userRole)).find(val => val === true);
        if (!result) return res.status(403).json({
            success: false,
            message: "Forbidden!",
        });
        next();
    }
}

module.exports = verifyRoles