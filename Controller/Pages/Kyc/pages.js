const path=require('path')



exports.getKycFormPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Kyc','userKycForm.html'))
}


