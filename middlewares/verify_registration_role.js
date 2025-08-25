

const verifyRegistrationRole = async (req, res, next) => {
    try {
        console.log(req?.body?.user_role);
        
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
        success: false,
        message: "Internal Server Error!",
    });
    }
}

module.exports = verifyRegistrationRole;