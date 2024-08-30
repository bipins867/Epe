const path=require('path')



exports.getLoginPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','UserAuthentication','login.html'))
}

exports.getSignUpPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','UserAuthentication','signUp.html'))
}

exports.getOtpVerifyPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','UserAuthentication','otpVerify.html'))
}