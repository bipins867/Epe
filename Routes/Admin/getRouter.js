const express=require('express')

const adminController=require('../../Controller/Pages/Admin/pages')

const router=express.Router();

router.get('/login',adminController.getLoginPage)
router.get('/dashboard',adminController.getDashboardPage)



module.exports=router;