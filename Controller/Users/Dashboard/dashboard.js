exports.getUserDasboardInfo = async (req, res, next) => {
  const user = req.user;

  try {
    const userKyc = await user.getUserKyc();
    const obj = { name: user.name, email: user.email, phone: user.phone };
    if (userKyc) {
      obj.kycStatus = userKyc.status;
    } else {
      obj.kycStatus = "Not Submitted";
      
    }
    obj.userKyc=userKyc;
    res
      .status(201)
      .json(obj);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong!" });
  }
};
