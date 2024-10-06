exports.getUserDasboardInfo = async (req, res, next) => {
  const user = req.user;

  try {
    const userKyc = await user.getUserKyc();
    const obj = { name: user.name, email: user.email, phone: user.phone,candidateId:user.candidateId };
    if (userKyc) {
      obj.kycStatus = userKyc.status;
    } else {
      obj.kycStatus = "Not Submitted";
      
    }
    obj.userKyc=userKyc;
    res
      .status(201)
      .json(obj);
  }catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: "Internal server error. Please try again later." });
  }
};
