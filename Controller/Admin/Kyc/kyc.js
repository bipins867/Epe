
const User = require("../../../Models/User/users");




exports.getUserDetails=async(req,res,next)=>{
    try {
        const emailId = req.params.emailId;
        const user = await User.findOne({ where: { email: emailId } });
    
        const userKyc=await user.getUserKyc();
        
        
    
        res.status(201).json({userKyc:userKyc})
      } catch (err) {
        console.log(err);
        return res
          .status(500)
          .json({ error: "Internal server error. Please try again later." });
      }
}