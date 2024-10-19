const express=require('express')

const announcementController=require('../../../../Controller/Admin/Basic/announcement')

const router=express.Router();


router.post('/getAll',announcementController.getAllAnnouncement)
router.post('/create',announcementController.createAnnouncement)
router.post('/update',announcementController.updateAnnouncementStatus)
router.post('/delete',announcementController.deleteAnnouncement)


module.exports=router;