const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userSession=require('../middleware/user/usersession')
const loginCheck=require('../middleware/user/loginCheck')
const Product = require('../models/productModel')

router.get("/",userController.userHome);
router.get("/login",loginCheck.loged ,userController.userLogin);
router.post("/login", userController.userVerification);
router.get("/signUp",loginCheck.loged,userController.userSignUp);
router.post("/signUp",userController.checkSignUp);
router.post("/verifyOTP",userController.otpVerify)
router.get("/logout", userController.userLogout);
router.get("/verifyOTP", loginCheck.loged,userController.otpVerifyPage)
router.get('/resend', loginCheck.loged,userController.resendOTP)
router.get('/forgot-password',loginCheck.loged,userController.forgotPassword)
router.post('/forgot-password',userController.sendEmail)
router.get('/verifyEmail',loginCheck.loged,userController.verifyEmailPage)
router.post('/verifyEmail',userController.verifyEmailOTP)
router.get('/resendEmail',loginCheck.loged,userController.resendEmail)
router.get('/new-password',loginCheck.loged,userController.newPassword)
router.post('/new-password',userController.submitPassword)
router.post('/add-address',userController.addNewAddress)


//User Side Homepage
router.get('/contact', userSession.isLogin,userController.contactPage)
router.get('/shop', userSession.isLogin,userController.productPage)
router.get('/product-page', userSession.isLogin, userController.productDetails)
router.get('/wish-list', userSession.isLogin,userController.wishListPage)
router.get('/add-wish-list',userSession.isLogin,userController.addWishList)
router.get('/remove-wish-list',userSession.isLogin,userController.removeWishList)
router.get('/cart',userSession.isLogin, userController.cartPage)
router.get('/add-cart',userSession.isLogin, userController.addCart)
router.get('/inc-queue',userSession.isLogin, userController.incrimentQuantity)
router.get('/remove-cart',userSession.isLogin, userController.removeCart)
router.get('/delete-cart',userSession.isLogin, userController.deleteCart)
router.get('/delete-cart',userSession.isLogin, userController.deleteCart)
router.get('/change-stat',userSession.isLogin,userController.setDefault)


router.get('/checkout',userSession.isLogin,userController.checkoutPage)

router.get('/user-profile',userSession.isLogin,userController.profilePage)
router.get('/user-address',userSession.isLogin,userController.addressPage)
router.post('/user-address',userSession.isLogin,userController.addAddress)
router.post('/edit-address',userSession.isLogin,userController.editAddress)
router.get('/delete-address',userSession.isLogin,userController.deleteAddress)

router.post('/user-profile',userSession.isLogin,userController.editUserSubmit)
router.post('/checkout-submit',userSession.isLogin,userController.orderCheck)
router.post('/razor_pay',userSession.isLogin,userController.initRazor)
router.post('/verify_Payment',userSession.isLogin,userController.verifyRazor)





router.get('/check-payment',userSession.isLogin,userController.checkPayment)

router.get('/orders',userSession.isLogin,userController.orderPage)
router.get('/order-detail',userSession.isLogin,userController.orderDetailPage)
router.get('/order-failed',userSession.isLogin,userController.orderFailed)

//patch

router.patch("/clear-filter",userController.clearFilter)
router.patch("/catFilter",userController.catFiltering)
router.patch("/colorFilter",userController.colorFiltering)
router.patch('/stockCheck',userController.stockStatus)
router.patch('/sort-check',userController.sortStatus)
router.patch('/check-page',userController.pageStatus)
router.patch('/check-address',userController.checkAddress)
router.patch('/check-coupon',userController.checkCoupon)
router.patch('/cancel-order',userController.cancelOrder)
router.patch('/check-password',userController.checkPassword)
router.post('/profile-passowrd',userSession.isLogin, userController.passwordChange)
router.patch('/search',userController.searchProduct)






module.exports = router;

