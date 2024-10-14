const path=require('path')

exports.getDashboardPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','TransactionHistory','transactionHistory.html'))
}
