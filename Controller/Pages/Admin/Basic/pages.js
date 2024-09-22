const path=require('path')

exports.getApplyLoanDashobard=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ApplyLoan','dashboard.html'))
}

exports.getContactUsDashobard=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ContactUs','dashboard.html'))
}




exports.getOpenApplyLoanList=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ApplyLoan','openApplyLoanList.html'))
}


exports.getOpenContactUsList=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ContactUs','openContactUsList.html'))
}

exports.getCloseApplyLoanList=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ApplyLoan','closeApplyLoanList.html'))
}


exports.getCloseContactUsList=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ContactUs','closeContactUsList.html'))
}


exports.getPendingApplyLoan=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ApplyLoan','pendingApplyLoan.html'))
}
exports.getPendingContactUs=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ContactUs','pendingContactUs.html'))
}


exports.getCloseApplyLoan=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ApplyLoan','closeApplyLoan.html'))
}
exports.getCloseContactUs=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ContactUs','closeContactUs.html'))
}

