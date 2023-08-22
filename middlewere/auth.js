const User=require('../models/userModels')
const isLogin = async(req,res,next) => {
    try {
        if (req.session.userId) {
            next()
        }
        else {
            res.redirect('/loginpage')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next) => {
    try {
        if (req.session.userId) {
            res.redirect('/')
        }
        else {
            next()
        }
    } catch (error) {
        console.log(error.message);
    }
}

const blockedstatus = async (req,res,next)=>{
    try {
     if(req.session.userId && (req.url === '/home' || req.url === '/products' || req.url === '/cart' || req.url ==='/order')) {
        const userId = req.session.userId;
        const userData = await User.findById(userId);
        if (userData && userData.status) {
            req.session.destroy();
            return res.render('loginpage', { message: 'your account has been blocked' });
        }
    }
    next();   
    } catch (error) {
        console.log(error.message);
}
}

module.exports = {
    isLogin,
    isLogout,
    blockedstatus
}
