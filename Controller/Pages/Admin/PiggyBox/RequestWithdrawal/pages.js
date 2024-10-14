const path=require('path')

exports.getDashboardPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','RequestWithdrawal','requestWithdrawal.html'))
}
exports.getCustomerPanelPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','RequestWithdrawal','customerPanel.html'))
}
exports.getPendingRequestListPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','RequestWithdrawal','pendingRequestWithdrawal.html'))
}
exports.getPreviousRequestListPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','RequestWithdrawal','previousRequestWithdrawal.html'))
}
