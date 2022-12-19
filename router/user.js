const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.userHome);
router.get("/login", userController.userLogin);
router.post("/login", userController.userVerification);
router.get("/signUp",userController.userSignUp);
router.post("/signUp",userController.checkSignUp);
router.post("/verifyOTP",userController.otpVerify)
module.exports = router;