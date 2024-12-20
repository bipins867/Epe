const Referrals = require("../../../Models/PiggyBox/referrals");
const UserDetails = require("../../../Models/User/userDetails");
const User = require("../../../Models/User/users");

exports.getUserDetails = async (req, res, next) => {
  const user = req.user;

  try {
    const userKyc = await user.getUserKyc({
      attributes: ["status", "userUrl"],
    });
    const userDetails = await UserDetails.findOne({
      where: {
        UserId: user.id,
      },
    });

    let referralDetails;
    const otherReferral = await Referrals.findOne({
      where: {
        referralId: user.byReferallId,
      },
    });

    if (otherReferral) {
      const otherUser = await User.findOne({
        where: {
          id: otherReferral.UserId,
        },
      });

      referralDetails = {
        name: otherUser.name,
        candidateId: otherUser.candidateId,
        referralId: user.byReferallId,
      };
    }

    const obj = {
      name: user.name,
      candidateId: user.candidateId,
      userDetails,
      userKyc,
      referralDetails,
    };
    if (userKyc) {
      obj.kycStatus = userKyc.status;
    } else {
      obj.kycStatus = "Not Submitted";
    }
    obj.userKyc = userKyc;
    res.status(201).json(obj);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.updateUserDetails = async (req, res, next) => {
  const user = req.user; // Authenticated user
  const {
    gender,
    maritalStatus,
    alternatePhone,
    fatherName,
    motherName,
    spouseName,
    employmentType,
    organizationName,
    designation,
    monthlyIncome,
  } = req.body;

  try {
    // Fetch the user's existing details
    let userDetails = await user.getDetails();

    // Update the userDetails if they exist, otherwise create new details
    if (userDetails) {
      await userDetails.update({
        gender,
        maritalStatus,
        alternatePhone,
        fatherName,
        motherName,
        spouseName,
        employmentType,
        organizationName,
        designation,
        monthlyIncome,
      });
    } else {
      await user.createDetails({
        gender,
        maritalStatus,
        alternatePhone,
        fatherName,
        motherName,
        spouseName,
        employmentType,
        organizationName,
        designation,
        monthlyIncome,
      });
    }

    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    console.error("Error updating user details:", error);
    res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
