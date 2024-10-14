const path=require('path')

exports.getDashboardPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','Customer','dashboard.html'))
}
exports.getCustomerListPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','Customer','customerList.html'))
}
exports.getEditCustomerPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','PiggyBox','Customer','editCustomer.html'))
}
