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

exports.getTermsAndConditionsPage=async(req,res,next)=>{
    res.sendFile(path.resolve('views','termsAndConditions.html'))
}

exports.getUserAgreementPage=async(req,res,next)=>{
    res.sendFile(path.resolve('views','userAgreement.html'))
}

