const express=require('express')

const pageController=require('../../Controller/Pages/pages')

const router=express.Router();

router.get('/career',pageController.getCarrerPage)
router.get('/privacyPolicy',pageController.getPrivacyPolicyPage)
router.get('/',pageController.getHomePage)



module.exports=router;