
const agreementData = require('../queries/agreement_data');

const verifyReviewEligible = async (req, res, next) => {
    try {
        const userId = req?.userId;
        if (!userId) return res.status(401).json({
            success: false,
            message: "Unauthorized!",
        });
        const reservationCount = await agreementData.getAgreements(userId);
        if (reservationCount < 1) return 
        res.status(403).json({
            success: false,
            message: "You need to have an accepted reservation to give reviews!",
        });
        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
        success: false,
        message: "Internal Server Error!",
    });
    }
}

module.exports = verifyReviewEligible;