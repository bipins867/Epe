const Role = require("../Models/User/role")


exports.kycRole=async(req,res,next)=>{
    const identifier='kycModule'
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

exports.contactUsRole=async(req,res,next)=>{
    const identifier='contactUs'
    const roleInfo=await Role.findOne({where:{identifier:identifier}})
    req.roleId=roleInfo.roleId;
    next();
}

exports.applyLoanRole=async(req,res,next)=>{
    const identifier='applyLoan'
    const roleInfo=await Role.findOne({where:{identifier:identifier}})
    req.roleId=roleInfo.roleId;
    next();
}

