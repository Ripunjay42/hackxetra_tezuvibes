const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');


router.post('/club/create',  clubController.createClub);

router.put("/club/:clubId/update", clubController.updateClubDetails);



//not fixed
router.delete("/club/:clubId/delete", clubController.deleteClub)


router.get('/:clubId/details',clubController.getDetailsofClub);

router.get("/:clubId/users",clubController.getAllUsers);

router.get("/:clubId/admins",clubController.getAllAdmins);

router.post('/club/:clubId/user/add', clubController.addClubMember);

router.post('/club/:clubId/admin/add', clubController.addNewAdmin);

router.delete("/club/:clubId/member/:userId/remove", clubController.removeClubMember);

module.exports = router;