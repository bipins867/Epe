const express=require('express')

const dashboardController=require('../../../Controller/Users/Dashboard/dashboard')

const router=express.Router();

router.get('/info',dashboardController.getUserDasboardInfo)



module.exports=router;