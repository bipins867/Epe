const path=require('path')

exports.getDashboardPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','AccountClouser','accountClouser.html'))
}
exports.getCustomerPanelPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','AccountClouser','customerPanel.html'))
}
exports.getPendingRequestListPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','AccountClouser','pendingAccountClouserRequest.html'))
}
exports.getPreviosRequestListPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','AccountClouser','previousAccountClouserRequest.html'))
}
