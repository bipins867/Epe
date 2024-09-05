const express=require('express')

const customerSupportController=require('../../Controller/CustomerSupport/customerSupport');
const { userChatSupportAuthentication } = require('../../Middleware/auth');


const router=express.Router();


router.post('/createCase',customerSupportController.createUserAndCase)
router.post('/closeCase',customerSupportController.closeCaseByUser)
router.post('/caseInfo',customerSupportController.getCaseInfo)
router.post('/caseMessages',customerSupportController.getCaseMessages)
router.post('/addMessage',userChatSupportAuthentication,customerSupportController.addUserMessage)


module.exports=router;