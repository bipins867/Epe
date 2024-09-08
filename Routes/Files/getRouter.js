const express=require('express')

const fileController=require('../../Controller/Files/files')

const router=express.Router();

router.get('/CustomerSupport/:caseId/:fileName',fileController.getChatSupportFile)
router.get('/:email/:fileType/:fileName',fileController.getFile);




module.exports=router;