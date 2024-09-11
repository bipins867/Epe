const Role = require("../Models/User/role")


exports.kycRole=async(req,res,next)=>{
    const identifier='kyc'
    const roleInfo=await Role.findOne({where:{identifier:identifier}})
    req.roleId=roleInfo.roleId;
    next();
}
exports.customerSupportRole=async(req,res,next)=>{
    const identifier='customerSupport'
    const roleInfo=await Role.findOne({where:{identifier:identifier}})
    req.roleId=roleInfo.roleId;
    next();
}

