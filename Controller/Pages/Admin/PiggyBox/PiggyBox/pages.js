const path=require('path')

exports.getDashboardPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','PiggyBox','piggyBox.html'))
}
exports.getManageFundsPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','PiggyBox','manageFunds.html'))
}
