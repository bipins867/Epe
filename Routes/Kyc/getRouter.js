const express=require('express')

const kycController=require('../../Controller/Pages/Kyc/pages')

const router=express.Router();

router.get('/userForm',kycController.getKycFormPage)



module.exports=router;