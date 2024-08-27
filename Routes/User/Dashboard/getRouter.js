const express=require('express')

const userDashboardController=require('../../../Controller/Pages/UserDashboard/pages')


const router=express.Router();

router.get('/',userDashboardController.getUserDashboardPage)



module.exports=router;