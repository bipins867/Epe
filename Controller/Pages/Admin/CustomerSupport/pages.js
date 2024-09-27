const path=require('path')

exports.getDashboardPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','CustomerSupport','dashboard.html'))
}


exports.getOpenCasesPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','CustomerSupport','openCases.html'))
}

exports.getTransferredCasesPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','CustomerSupport','transferredCases.html'))
}


exports.getClosedCasesPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','CustomerSupport','closedCases.html'))
}


exports.getPendingCasesPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','CustomerSupport','pendingCases.html'))
}


exports.getCaseMessagesPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','CustomerSupport','caseMessages.html'))
}


