const express = require('express');
const userRouter = express();
const session = require('express-session');
const userController = require("../controllers/userController");
const orderController = require('../controllers/orderController')
const couponcontroller = require('../controllers/coupenController')
const config = require('../config/config')
const upload = require('../middlewere/multer')
const nocache = require('nocache');
userRouter.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false
}))

const auth = require("../middlewere/auth")
const blocked = require("../middlewere/blockfind")
userRouter.set('view engine', 'ejs');
userRouter.set('views', './views/user')
const bodyParser = require('body-parser');
userRouter.use(bodyParser.json())
userRouter.use(bodyParser.urlencoded({ extended: true }));
userRouter.use(nocache());

// GET

userRouter.get("/",nocache(), userController.loadHome);
userRouter.get('/signup', auth.isLogout,nocache(), userController.loadSignup)
userRouter.get('/signup/:referralCode', auth.isLogout,nocache(), userController.loadSignup);
userRouter.get("/home", auth.blockedstatus,nocache(), userController.loadHome);
userRouter.get('/block',nocache(), userController.blockuser);
userRouter.get('/unblock',nocache(),userController.unblockuser);
userRouter.get("/loginpage",auth.isLogout,nocache(), userController.loginLoad)
userRouter.get('/userotp',nocache(), userController.loadOTP);
userRouter.get('/products',auth.blockedstatus, auth.isLogin,nocache(), userController.listProducts);
userRouter.get('/detailesproduct', auth.blockedstatus,nocache(), userController.detailproduct);
userRouter.get('/userprofile', auth.blockedstatus, auth.isLogin,nocache(), userController.detaileprofile);
userRouter.get('/update',nocache(), userController.updateprofile);
userRouter.get("/cart",nocache(), auth.blockedstatus, auth.isLogin,nocache(), userController.getcart)
userRouter.get("/checkout",nocache(), auth.isLogin,nocache(), userController.checkout);
userRouter.get("/forget",nocache(), userController.forgotPassword)
userRouter.get("/updatePassPage",nocache(), userController.updatePassword)
userRouter.get("/orderplaced",nocache(), userController.confermation);
userRouter.get("/order",auth.blockedstatus, auth.isLogin,nocache(), userController.getOrder);
userRouter.get("/editaddress",nocache(), userController.editaddress)
userRouter.get("/delete-address",nocache(), userController.deleteAddress);
userRouter.get("/singleOrder",auth.isLogin,nocache(), userController.singleOrder);
userRouter.get('/cancelOrder',nocache(), orderController.cancelOrder)
userRouter.get("/logout",auth.isLogin,nocache(), userController.Logout);
userRouter.get("/returnOrder",nocache(), orderController.returnOrder)
userRouter.get('/contacts', auth.isLogin,nocache(),userController.laodcontcts)
userRouter.get('/wishlist',auth.isLogin,nocache(),userController.loadwishlist)
userRouter.get("/addtowishlist",auth.isLogin,nocache(),userController.addtowishlist);




userRouter.post("/signup", userController.insertUser);
userRouter.post('/signup/:referralCode', userController.insertUser);
userRouter.post("/loginpage", blocked, userController.verifyLogin)
userRouter.post('/verifyOtp', userController.verifyOTP);
userRouter.post('/updateprofile', upload.single('image'), userController.profileupdated);
userRouter.post("/addtocart", userController.addtocart);
userRouter.post("/deleteCart", userController.deleteCart);
userRouter.post('/addAddress', auth.isLogin, userController.addingAddress)
userRouter.post("/updatePass", userController.forgotPass);
userRouter.post("/forgot", userController.forgotSubmit);
userRouter.post("/setpass", userController.updatePass);
userRouter.post("/checkotpre", userController.passForgotOtp);
userRouter.post("/updateaddress", userController.updateaddress)
userRouter.post("/place-order", userController.postPlaceOrder);
userRouter.post("/verifyPayment", userController.verifyPayment);
userRouter.post("/changeQty", userController.changeQty);
// userRouter.post("/paginate", userController.paginate);
userRouter.post('/checkWallet', orderController.checkWallet)
userRouter.post('/applycoupon', userController.applycoupon)
userRouter.post("/deletewish", userController.deletewish);



module.exports = userRouter;
