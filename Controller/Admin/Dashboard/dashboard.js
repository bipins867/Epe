exports.getDashboardInfo = async (req, res, next) => {
  const admin = req.admin;

  try {
    const obj = { userName: admin.userName, adminType: admin.adminType };

    res.status(201).json({ adminInfo: obj });
  } catch (err) {
    console.error("Error during admin login:", err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
