const express=require('express')

const pageController=require('../../Controller/Pages/pages')

const router=express.Router();

router.get('/aboutUs',pageController.getAboutUsPage)
router.get('/careers',pageController.getCareersPage)
router.get('/services',pageController.getServicesPage)
router.get('/dashboard',pageController.getDashboardPage)


module.exports=router;