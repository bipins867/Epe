const path=require('path')



exports.getUserDashboardPage=async(req,res,next)=>{

    res.sendFile(path.resolve('views','UserDashboard','dashboard.html'))
}


