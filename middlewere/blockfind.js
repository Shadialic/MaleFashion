const user = require('../models/userModels')
const product=require('../models/productModel')

const  blockfunction  =  async (req,res,next)=>{
    const userData = await user.findOne({email:req.body.email})
    if(userData?.status == true){
        res.render("loginpage",{message:"your account has been blocked"})
    }else{
        next()
    }
}

module.exports=blockfunction;