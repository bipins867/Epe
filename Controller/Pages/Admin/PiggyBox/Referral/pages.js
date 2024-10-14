const path=require('path')

exports.getDashboardPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','Referral','referral.html'))
}
exports.getCustomerPanelPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','Referral','customerPanel.html'))
}
