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