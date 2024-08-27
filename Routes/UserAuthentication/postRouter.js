const express=require('express')

const userAuthenticationController=require('../../Controller/Users/users');
const {  checkValidationErrors, validateLogin, validateSignUp } = require('../../Middleware/validator');

const router=express.Router();

router.post('/login',validateLogin,checkValidationErrors,userAuthenticationController.userLogin)
router.post('/signUp',validateSignUp,checkValidationErrors,userAuthenticationController.userSignUp)




module.exports=router;