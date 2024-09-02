const path=require('path')



exports.getHomePage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','index.html'))
}


exports.getCarrerPage=async(req,res,next)=>{
    res.sendFile(path.resolve('views','career.html'))
}

exports.getPrivacyPolicyPage=async(req,res,next)=>{
    res.sendFile(path.resolve('views','privacyPolicy.html'))
}