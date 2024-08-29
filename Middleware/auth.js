const jwt = require("jsonwebtoken");
const User=require('../Models/User/users');
const Admin = require("../Models/User/admins");


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