const path=require('path')

exports.getApplyLoanDashobard=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ApplyLoan','dashboard.html'))
}

exports.getContactUsDashobard=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ContactUs','dashboard.html'))
}




exports.getOpenApplyLoan=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ApplyLoan','openApplyLoan.html'))
}


exports.getOpenContactUs=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','Basic','ContactUs','openContactUs.html'))
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

