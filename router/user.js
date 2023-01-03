const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userSession=require('../middleware/user/usersession')

router.get("/",userSession.isLogin, userController.userHome);
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



//User Side Homepage

router.get('/shop', userSession.isLogin,userController.productPage)
router.get('/product-page', userSession.isLogin, userController.productDetails)
router.get('/wish-list', userSession.isLogin,userController.wishListPage)
router.get('/add-wish-list',userSession.isLogin,userController.addWishList)
router.get('/remove-wish-list',userSession.isLogin,userController.removeWishList)
router.get('/cart',userSession.isLogin, userController.cartPage)
router.get('/add-cart',userSession.isLogin, userController.addCart)
router.get('/inc-queue',userSession.isLogin, userController.incrimentQuantity)
router.get('/remove-cart',userSession.isLogin, userController.removeCart)



module.exports = router;