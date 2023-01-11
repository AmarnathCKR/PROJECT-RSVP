const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const Category = require("../models/categoryModel");
const multer = require('multer')
const upload = require('../utilities/imageUploader')

router.get("/", adminController.adminSignin);
router.post("/", adminController.adminVerification);

router.get('/customer', adminController.adminCustomer)
router.get('/dashboard', adminController.adminDashboard)
router.get('/category', adminController.adminCategory)
router.get('/products', adminController.adminProduct)
router.get('/order', adminController.adminOrder)
router.get('/banner',adminController.bannerPage)


// router.get('/adduser', adminController.addUserPage)
// router.post('/adduser', adminController.addUser);

router.get('/block-user', adminController.blockUser)
router.get('/unBlock-user', adminController.unBlockUser)
router.get('/delete-category', adminController.deleteCategory)
router.get('/unBlock-category',adminController.unblockCategory)
router.get('/block-category',adminController.blockCategory)

router.get('/edit-category', adminController.editCategory)
router.get('/add-category', adminController.addCategory)
router.post('/add-category',upload.single('image') ,adminController.categorySubmit)
router.post('/edit-category',upload.single('image') ,adminController.submitEditCategory)
router.get('/add-product', adminController.addProduct)
router.post('/add-product', upload.array('image',6), adminController.submitProduct)
router.get('/edit-product',adminController.editProduct)
router.post('/edit-product', upload.array('image',6), adminController.submitEditProduct)
router.get('/delete-product',adminController.deleteProduct)
router.get('/block-product',adminController.blockProduct)
router.get('/unBlock-product',adminController.unBlockProduct)
router.get('/coupon',adminController.couponPage)
router.get('/delete-coupon',adminController.deleteCoupon)
router.get('/block-coupon',adminController.blockCoupon)
router.get('/unBlock-coupon',adminController.unBlockCoupon)
router.get('/add-coupon',adminController.addCoupon)
router.post('/add-coupon',adminController.submitCoupon)
router.get('/add-banner',adminController.addBanner)
router.post('/add-banner', upload.single('image') ,adminController.submitBanner)
router.get('/block-banner',adminController.blockBanner)
router.get('/unBlock-banner',adminController.unBlockBanner)


    
// router.get('/edit-user', adminController.editUser)
// router.post('/edit-user', adminController.adminEdited)

router.get('/logout', adminController.adminLogOut)

router.patch('/change-stat', adminController.changeOrder)


module.exports = router;