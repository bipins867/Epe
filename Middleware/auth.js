const jwt = require("jsonwebtoken");
const User=require('../Models/User/users');
const Admin = require("../Models/User/admins");
const CaseMessage = require("../Models/CustomerSupport/caseMessage");
const CaseUser = require("../Models/CustomerSupport/caseUser");
const CustomerCase = require("../Models/CustomerSupport/customerCase");



exports.userAuthentication=async (req,res,next)=>{
    
    try{
        const token=req.headers.authorization;
        const payload=jwt.verify(token,process.env.JWT_SECRET_KEY)
        const user=await User.findByPk(payload.id)
        
        req.user=user;
        
        next();
        
        
    }
    catch(err){
        return res.status(503).json({error:"Invalid Signature!"})
    }
}

exports.adminAuthentication=async(req,res,next)=>{
    try{
        const token=req.headers.authorization;
        const payload=jwt.verify(token,process.env.JWT_SECRET_KEY)
        const admin=await Admin.findByPk(payload.id)
        
        req.admin=admin;
        
        next();
        
        
    }
    catch(err){
        return res.status(503).json({error:"Invalid Signature!"})
    }
}
exports.userChatSupportAuthentication=async(req,res,next)=>{
    try{
        const token=req.headers.chattoken;
       
        const payload=jwt.verify(token,process.env.JWT_SECRET_KEY)
        
        
        const customerCase=await CustomerCase.findOne({where:{caseId:payload.caseNumber}})
        
        const caseUser=await CaseUser.findByPk(customerCase.CaseUserId)
        
        if(!caseUser && !customerCase){
            throw new Error("User or Case not found!")
        }
        req.caseUser=caseUser;
        req.customerCase=customerCase
        
        next();
        
        
    }
    catch(err){
        return res.status(503).json({error:"Invalid Signature!"})
    }
}

exports.roleSAuthentication=async(req,res,next)=>{
    try{
        const admin=req.admin;
        
        if(!(admin.adminType=='SSA' || admin.adminType=='SA')){
            throw new Error("Un-Authorized Access!")
        }

        next();
        
        
    }
    catch(err){
        return res.status(403).json({error:"Un-Authorized Access!"})
    }
}

exports.roleSSAuthentication=async(req,res,next)=>{
    try{
        const admin=req.admin;
        
        if(admin.adminType!='SSA'){
            throw new Error("Un-Authorized Access!")
        }

        next();
        
        
    }
    catch(err){
        return res.status(403).json({error:"Un-Authorized Access!"})
    }
}

exports.roleAuthentication=async(req,res,next)=>{
    
}

