const path=require('path')


exports.getKycDashboardPage=async(req,res,next)=>{
    res.sendFile(path.resolve('views','Admin','Kyc','dashboard.html'))
}
exports.getUserDetailsPage=async(req,res,next)=>{
    const userId = req.params.userId;
    res.sendFile(path.resolve('views','Admin','Kyc','userDetails.html'))
}