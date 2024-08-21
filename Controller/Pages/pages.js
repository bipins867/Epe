const path=require('path')



exports.getAboutUsPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','aboutUs.html'))
}

exports.getServicesPage=async(req,res,next)=>{
    res.sendFile(path.resolve('views','services.html'))
}

exports.getCareersPage=async(req,res,next)=>{
    res.sendFile(path.resolve('views','careers.html'))
}
exports.getDashboardPage=async(req,res,next)=>{
    res.sendFile(path.resolve('views','dashboard.html'))
}