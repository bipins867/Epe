const path=require('path')

exports.getLoginPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','login.html'))
}

exports.getDashboardPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','Admin','dashboard.html'))
}

exports.getEditAdminPage=async(req,res,next)=>{
    res.sendFile(path.resolve('views','Admin','editAdmin.html'))

}

exports.getEditUserAdminPage=async(req,res,next)=>{
    res.sendFile(path.resolve('views','Admin','editUserAdmin.html'))

}