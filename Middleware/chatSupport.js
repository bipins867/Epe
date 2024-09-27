const CustomerCase = require("../Models/CustomerSupport/customerCase");


exports.verifyAdminAssociation = async (req, res, next) => {
  try {
    const { caseId } = req.body; // Case ID passed in the request body
    const { adminType, userName: adminId } = req.admin; // Admin info from req.admin (extracted from middleware)

    // If the adminType is 'SSA' or 'SA', proceed to the next middleware
    if (adminType === "SSA" || adminType === "SA") {
      return next();
    }

    // Check if adminType is 'A' and validate the admin association with the case
    if (adminType === "A") {
      // Find the case by caseId
      const customerCase = await CustomerCase.findOne({
        where: { caseId },
      });

      // If the case is not found or the admin is not associated with the case, return an error
      if (!customerCase) {
        return res.status(404).json({ error: "Case not found." });
      }

      // If the admin is not assigned to the case, return unauthorized
      if (customerCase.adminId !== adminId) {
        return res.status(403).json({ error: "You are not authorized to access this case." });
      }
    }

    // If everything checks out, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong while verifying admin association." });
  }
};
exports.verifyAdminAssociationByParams = async (req, res, next) => {
  try {
    const { caseId } = req.params; // Case ID passed in the request body
    const { adminType, userName: adminId } = req.admin; // Admin info from req.admin (extracted from middleware)

    // If the adminType is 'SSA' or 'SA', proceed to the next middleware
    if (adminType === "SSA" || adminType === "SA") {
      return next();
    }

    // Check if adminType is 'A' and validate the admin association with the case
    if (adminType === "A") {
      // Find the case by caseId
      const customerCase = await CustomerCase.findOne({
        where: { caseId },
      });

      // If the case is not found or the admin is not associated with the case, return an error
      if (!customerCase) {
        return res.status(404).json({ error: "Case not found." });
      }

      // If the admin is not assigned to the case, return unauthorized
      if (customerCase.adminId !== adminId) {
        return res.status(403).json({ error: "You are not authorized to access this case." });
      }
    }

    // If everything checks out, proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong while verifying admin association." });
  }
};
  