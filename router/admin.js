const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/", adminController.adminSignin);
router.post("/", adminController.adminVerification);

router.get('/customer', adminController.adminCustomer)
router.get('/dashboard', adminController.adminDashboard)


// router.get('/adduser', adminController.addUserPage)
// router.post('/adduser', adminController.addUser);

router.get('/block-user', adminController.blockUser)
router.get('/unBlock-user', adminController.unBlockUser)

// router.get('/edit-user', adminController.editUser)
// router.post('/edit-user', adminController.adminEdited)

router.get('/logout', adminController.adminLogOut)

module.exports = router;