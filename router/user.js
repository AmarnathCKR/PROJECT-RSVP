const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.userHome);
router.get("/login", userController.userLogin);
router.post("/login", userController.userVerification);
router.get("/signUp",userController.userSignUp);
router.post("/signUp",userController.checkSignUp);
router.post("/verifyOTP",userController.otpVerify)
router.get("/logout", userController.userLogout);
router.get("/verifyOTP",userController.otpVerifyPage)
router.get('/resend',userController.resendOTP)
router.get('/forgot-password',userController.forgotPassword)
router.post('/forgot-password',userController.sendEmail)
router.get('/verifyEmail',userController.verifyEmailPage)
router.post('/verifyEmail',userController.verifyEmailOTP)
router.get('/resendEmail',userController.resendEmail)
router.get('/new-password',userController.newPassword)
router.post('/new-password',userController.submitPassword)
module.exports = router;