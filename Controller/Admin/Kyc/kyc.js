const UserKyc = require("../../../Models/Kyc/userKyc");
const User = require("../../../Models/User/users");


exports.getPendingKycs = async (req, res, next) => {
  try {
    // Fetch all KYC entries with status "Pending", including the associated User's phone
    const pendingKycList = await UserKyc.findAll({
      where: {
        status: "Pending", // Filter by pending status
      },
      include: [
        {
          model: User,
          attributes: ["phone"], // Only include the phone field from the User model
        },
      ],
    });

    // Check if any pending KYC entries are found
    if (pendingKycList.length === 0) {
      return res.status(404).json({ message: "No pending KYC entries found." });
    }

    // Return the list of pending KYC entries with the associated user phones
    return res.status(200).json({
      message: "Pending KYC entries fetched successfully.",
      pendingKycList,
    });
  } catch (error) {
    console.error("Error fetching pending KYC entries:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getUserDetails = async (req, res, next) => {
  try {
    const phone = req.params.phone;
    const user = await User.findOne({ where: { phone: phone } });

    const userKyc = await user.getUserKyc();

    res.status(201).json({ userKyc: userKyc, user: user });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};

exports.updateKycStatus = async (req, res, next) => {
  try {
    const { phone, status, message } = req.body;
    const user = await User.findOne({ where: { phone: phone } });

    const userKyc = await user.getUserKyc();

    if (status) {
      const obj = { status: "Completed", adminMessage: "",adminId:req.admin.userName };
      await userKyc.update(obj);
    } else {
      const obj = { status: "Rejected", adminMessage: message,adminId:req.admin.userName };

      await userKyc.update(obj);
    }

    res.status(201).json({ message: "KYC updated successfully!" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
