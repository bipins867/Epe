const express=require('express')

const dashboardController=require('../../../Controller/Users/Dashboard/dashboard')

const router=express.Router();

router.get('/getUserDetails',dashboardController.getUserDetails);
router.post('/updateUserDetails',dashboardController.updateUserDetails);


module.exports=router;