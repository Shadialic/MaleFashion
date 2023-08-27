const express=require('express');
const adminRoutes=express();
const session=require('express-session');
const config=require('../config/config');
const upload = require('../middlewere/multer')
const multer=require('multer')

adminRoutes.use(session({
    secret:config.sessionSecret,
    resave: false,
    saveUninitialized: false
}))
const nocache = require('nocache');
const bodyParser =require('body-parser');
adminRoutes.use(bodyParser.json())
adminRoutes.use(bodyParser.urlencoded({extended:true}));
adminRoutes.set('view engine','ejs');
adminRoutes.set('views','./views/admin');
const auth=require('../middlewere/adminAuth')

const adminController = require("../controllers/adminController");
const categoryController = require('../controllers/category');
const productController=require('../controllers/productController')
const orderController=require('../controllers/orderController')
const couponcontroller=require('../controllers/coupenController')
const bannerController = require("../controllers/bannerController")

adminRoutes.use(nocache());




// <=-----------users rortes
adminRoutes.get("/",auth.isLogout,nocache(),adminController.loadLogin);
adminRoutes.post('/',nocache(),adminController.verifyAdmin);
adminRoutes.get('/adminHome',nocache(),adminController.loadDashboard)
adminRoutes.get('/logout',nocache(), adminController.logout);
adminRoutes.get('/users',nocache(),adminController.userTable)

//<=----------- category routes
adminRoutes.get('/category',nocache(),categoryController.loadcategory)
adminRoutes.get('/addcategory',nocache(),categoryController.addcategory);
adminRoutes.post('/addcategory',nocache(),categoryController.categoryadd)
adminRoutes.get('/edit-category',nocache(),categoryController.editcategory)
adminRoutes.post('/edit-category',nocache(),categoryController.updatedcategory);
adminRoutes.get('/delete-category',nocache(),categoryController.deletecategory)
adminRoutes.get('/show-category',nocache(),categoryController.unlistCategory)

// <=----------Product routes
adminRoutes.get('/product',nocache(),productController.loadProduct)
adminRoutes.get('/addproduct',nocache(),productController.productadd)
adminRoutes.post('/addproduct',upload.array("image",3),productController.addproduct);
adminRoutes.get('/editproduct',nocache(),productController.poductedit)
adminRoutes.post('/editproduct',upload.array('image'),productController.editedproduct)
adminRoutes.post("/removeimage",nocache(), productController.removeimage)
adminRoutes.get('/show-products', productController.unlistproduct)
adminRoutes.get('/delete-products',nocache(),productController.deleteproduct)

// <=-------Order routes
adminRoutes.get('/orders',nocache(), orderController.getOrder);
adminRoutes.get('/singleOrder',nocache(),orderController.viewOrder);
adminRoutes.post("/updateStatus",nocache(),orderController.updatestatus)


// <=---------Coupen routes
adminRoutes.get("/coupon",nocache(),couponcontroller.getCoupon);
adminRoutes.get("/addCoupon",nocache(),couponcontroller.getaddcoupon);
adminRoutes.post("/addCoupon",nocache(),couponcontroller.postaddcoupon);
adminRoutes.get("/deletecoupon",nocache(), couponcontroller.deleteCoupon);
adminRoutes.get('/editcoupon',nocache(),couponcontroller.editcoupon)
adminRoutes.post('/editcoupon',nocache(),couponcontroller.updatedcoupon)

// banners 
adminRoutes.get("/banners",auth.isLogin,nocache(),bannerController.getBanner);
adminRoutes.get('/addBanner',auth.isLogin,nocache(),bannerController.getAddBanner)
adminRoutes.post('/addBanner',nocache(), upload.single('image'),bannerController.postAddBanner)
adminRoutes.get('/showBanner',auth.isLogin,nocache(),bannerController.unlistBanner)
adminRoutes.get("/deletebanner",auth.isLogin,nocache(),bannerController.deletebanner);

// sales Report
adminRoutes.get("/salesreport",nocache(), adminController.getSalesReport)
adminRoutes.get("/report",nocache(),orderController.report);

module.exports = adminRoutes;