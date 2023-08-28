const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const { otpGen } = require('../controllers/generateOtp')
const { reffrelcodeGen } = require('../controllers/referral')
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Address = require('../models/addressModel')
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel')
const Coupon = require("../models/coupenModel");
const Banner = require('../models/bannerModel')
const Wish = require('../models/wishlistModel')
require("dotenv").config();
const mongoose = require('mongoose');
const offerSchema = require('../models/offerModel');
const productOfferSchema = require('../models/productOffersModel');
const ObjectId = mongoose.Types.ObjectId;
const Razorpay = require("razorpay");
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID_KEY,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const nodemailer = require('nodemailer');
// const { CURSOR_FLAGS } = require('mongodb');

const securePassword = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
}

const loadHome = async (req, res) => {
  try {
    let userData;

    if (req.session.userId) {
      userData = true;
    } else {
      userData = false;
    }

    const data = await Product.find();
    const bannerData = await Banner.find();


    res.render('home', { userData, banner: bannerData, products: data });
  } catch (error) {
    console.log(error.message);
  }
};


const OTP = otpGen();
const reffrelcodes = reffrelcodeGen();
const reffrelcode = reffrelcodes[0];



const loadSignup = async (req, res) => {
  try {

    const referralCode = req.params.referralCode;
    if (referralCode != undefined) {

      res.render('signup', { referralCode });

    } else {
      res.render('signup')
    }
  } catch (error) {
    console.log(error.message);
  }
}

const sendOTP = async (username, email, otp,) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS
      }
    });

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: 'Your OTP',
      text: OTP
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(" Email has been sent", info.response);
      }
    });

  } catch (error) {
    console.log("error is on sendOTP method", error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
}


const insertUser = async (req, res) => {

  try {
    const userData = {
      username: req.body.username,
      mobile: req.body.mobile,
      email: req.body.email,
      password: req.body.password,
      userreferralCode: req.params.referralCode
    }
    req.session.userData = userData
    req.session.otp = OTP;

    sendOTP(userData.username, userData.email, OTP);
   
    res.redirect('/userotp');


  } catch (error) {
    console.log(error.message);

  }
}
const loadOTP = async (req, res) => {

  try {

    const userData=req.session.userData;

    res.render('userotp', { email: userData.email });


  } catch (error) {
    console.log('loadOTP method', error.message);
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email, username } = req.session.userData;
    const newOTP = otpGen();
    req.session.otp = newOTP;

    sendOTP(username, email, newOTP);
    res.render('userotp', { email });
  } catch (error) {
    console.log('resendOTP method', error.message);
    res.render('userotp', { error: 'An error occurred. Please try again later.' });
  }
};

const verifyOTP = async (req, res) => {

  try {
    const otp = req.session.otp;
     function referalchecking() {
      let reffrelcodes = reffrelcodeGen();
      reffrelcode = reffrelcodes[0]
      return reffrelcode;
    }

    const referalcheck = await User.findOne({ referral: reffrelcode })
    let referrals
    if (referalcheck) {
      referalchecking()
    } else {

      referrals = reffrelcode
    }


    if (otp == OTP) {
      const { username, email, mobile, password, userreferralCode } = req.session.userData;

      let checkuser = await User.findOne({ referral: userreferralCode });
      let checkemail = email
      const secPassword = await securePassword(password);
      const user = new User({
        mobile: mobile,
        username: username,
        email: email,
        password: secPassword,
        referral: referrals,
        is_admin: 0,
      });
      const userData = await user.save();
      if (checkuser) {
        const user = await User.findOne({ email: checkemail })

        user.wallet = 50;
        const userData = await user.save();
      }

      if (userData) {
        res.render('loginpage', { message: 'Registration Success' });
      } else {
        res.render('signup', { message: 'Registarion Failed' })
      }
    } else {
      res.render('signup', { message: 'Incorrect OTP' })
    }

  } catch (error) {
    console.log('in VerifyOTP:- ', error.message);
  }

};


const Logout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("loginpage");
  } catch (error) {
    console.log(error.message);
  }
};
const loginLoad = async (req, res) => {
  try {
    console.log("hell");
    res.render('loginpage');
  } catch (error) {
    console.log(error.message);
  }
}
const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;


    const userData = await User.findOne({ email: email });

    req.session.userId = userData._id;


    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password)
      if (passwordMatch) {

        res.redirect('/home')
      } else {

        res.render('loginpage', { message: 'password is incorrect' });
      }
    } else {
      res.render('loginpage', { message: 'username or password is incorrect' });
    }

  } catch (error) {
    console.log(error.message);
  }
}
const blockuser = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.query.id });
    if (userData) {
      await User.updateOne({ _id: userData._id }, { status: true });
      res.redirect("/admin/users");
    }
  } catch (error) {
    console.log(error);
  }
};
const forgotpasswordotp = (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILER_EMAIL,
      pass: process.env.NODEMAILER_PASS
    },
  });

  const mailOptions = {
    from: "shadilsa786@gmail.com",
    to: email,
    subject: "Your OTP",
    text: `Your OTP is ${otp}`,
  };

  // send the email-------------------

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent:" + info.response);
    }
  });
};


const forgotPassword = (req, res) => {
  try {
    res.render("forget", { user: true });
  } catch (err) {
    console.log(err)
  }
};
const forgotPass = async (req, res) => {
  try {
    const userEmail = req.body.email;
    const oneTimePin = otpGen();
    req.session.userMail = userEmail;
    req.session.oneTimePin = oneTimePin;

    forgotpasswordotp(userEmail, oneTimePin);
    res.render('forotp', { message: 'OTP sent successfully' });
  } catch (err) {
    console.log(err);
  }
};

const updatePassword = (req, res) => {
  try {
    const id = req.query.id;

    res.render("updatepass", { user: true, id });
  } catch (err) {
    console.log(err)
  }
};

const updatePass = async (req, res) => {
  try {
    const email = req.session.userMail;
    const password = req.body.password;
    const hashPass = await securePassword(password);
    await User.updateOne({ email: email }, { $set: { password: hashPass } }); // Use email from session
    res.redirect('/loginpage');
  } catch (err) {
    console.log(err);
  }
};
const forgotSubmit = (req, res) => {
  const oneTimePin = otpGen();
  const { email } = req.body;
  forgotpasswordotp(email, oneTimePin);
  req.session.pass = oneTimePin;
  res.render("forotp");
};

const passForgotOtp = async (req, res) => {
  try {
    const { val1, val2, val3, val4, val5, val6 } = req.body;
    const formOtp = Number(val1 + val2 + val3 + val4 + val5 + val6);
    const storedOtp = req.session.oneTimePin;

    if (formOtp == storedOtp) {
      res.render('updatepass', { message: 'OTP verified' });
    } else {
      res.render('forotp', { message: 'Incorrect OTP' });
    }
  } catch (error) {
    console.log('passForgotOtp', error.message);
  }
};
// UnBlock user
const unblockuser = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.query.id });
    if (userData) {
      await User.updateOne({ _id: userData._id }, { status: false });
      res.redirect("/admin/users");
    }
  } catch (error) {
    console.log(error);
  }
};
const listProducts = async (req, res) => {
  try {

    const baseCategory = await Category.find()
    let search = req.query.search || ""
    let filter2 = req.query.filter || 'ALL'
    let categoryId = req.query.categoryId;

    var minPrice = 0
    var maxPrice = 100000
    var sortValue = 1

    if (req.query.minPrice) {
      minPrice = req.query.minPrice
    }

    if (req.query.maxPrice) {
      maxPrice = req.query.maxPrice
    }

    var sortValue = 1;
    if (req.query.sortValue) {
      sortValue = req.query.sortValue
    }


    if (categoryId) {
      query.category = categoryId

    }

    let sort = req.query.sort || "0";
    const pageNO = parseInt(req.query.page) || 1;
    const perpage = 6;
    const skip = perpage * (pageNO - 1)
    const catData = await Category.find({ status: false })
    let cat = catData.map((category) => category._id);
    let filter;
    if (filter2 === "ALL") {
      filter = [...cat];
    } else {
      filter = req.query.filter.split(',').map(filterItem => {
        try {
          return new ObjectId(filterItem);
        } catch (error) {
          console.error('Invalid ObjectId:', filterItem);
          return null;
        }
      });
      filter = filter.filter(item => item !== null);
    }
    req.query.sort == "High" ? sort = -1 : sort = 1;

    minPrice = Number(minPrice)
    maxPrice = Number(maxPrice)

    const data = await Product.aggregate([
      {
        $match:
        {
          productname: { $regex: search, $options: "i" },
          category: { $in: filter },
          price: { $gte: minPrice, $lt: maxPrice },
          status: false
        }
      },
      { $sort: { price: sort } },
      { $skip: skip },
      { $limit: perpage }
    ])

    if (req.query.search) {
      search = req.query.search;
    }


    const productCount = await Product.find({ productname: { $regex: search, $options: "i" }, category: { $in: filter }, price: { $gte: minPrice, $lt: maxPrice } }).countDocuments();

    const totalPage = Math.ceil(productCount / perpage)

    let cartCount = 0;
    if (req.session.userId) {
      const countCart = await Cart.findOne({ user: req.session.userId });
      if (countCart && countCart.product) {
        cartCount = countCart.product.length;
      }
    }

    const productOffer = await productOfferSchema.find({ status: 'Active', productname: data._id, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } }).sort({ discountPercentage: 1 });

    const offers = await offerSchema.find({ status: 'Active', baseCategory: data._id, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } }).populate('category').sort({ discountPercentage: 1 })
    const id = req.query.id;
    const datas = await Product.findById(id).populate("category");


    res.render("products", {
      user: data,
      data2: catData,
      total: totalPage,
      filter: filter,
      sort: sort,
      search: search,
      cartCount: cartCount,
      categoryId: categoryId,
      baseCategory,
      minPrice,
      maxPrice,
      sortValue,
      offers,
      productOffer,
      productCount,
      product: datas,
    })

  } catch (error) {
    console.log(error);
  }
}


const detailproduct = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await Product.findById(id).populate("category");

    if (data) {
      res.render("detailesproduct", { product: data });
    } else {
      res.render("error", { message: "Product not found." });
    }
  } catch (error) {
    console.error("Error in detailproduct:", error);
    res.render("error", { message: "An error occurred." });
  }
};

const detaileprofile = async (req, res) => {

  try {
    const userData = await User.findOne({ _id: req.session.userId });
    const history = userData.wallehistory;
    const orderData = await Order.findOne();
    const Total = userData.wallet + orderData.totalAmount;
    const total = req.session.total;
    const wall = userData.wallet - total;
    const reffrelcode = userData.referral
    const inviteLink = '/signup';



    console.log(reffrelcode, 'referralCode');


    res.render("userprofile", {
      data: userData,
      address: userData.address,
      Total,
      wall,
      history,
      reffrelcode,
      inviteLink
    });

  } catch (error) {
    console.log(error.message);
  }
};

const updateprofile = async (req, res) => {
  try {
    const id = req.query.id;
    const userData = await User.findById({ _id: id })

    if (userData) {
      res.render('updateprofile', { user: userData });
    } else {
      res.redirect('/home')
    }
  } catch (error) {
    console.log(error.message);
  }
}
const profileupdated = async (req, res) => {
  try {
    if (req.file) {
      const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { username: req.body.username, email: req.body.email, mobile: req.body.mobile, image: req.file.filename } })
    } else {
      const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { username: req.body.username, email: req.body.email, mobile: req.body.mobile } })
    }
    res.redirect('/userprofile');
  } catch (error) {
    console.log(error.message);
  }
}

//cart page------------------------
const getcart = async (req, res) => {
  try {
    if (req.session.userId) {
      console.log(req.session.userId);
      const user = await User.findOne({ _id: req.session.userId });
      const id = user._id;
      const product = await Product.find();
      const cart = await Cart.findOne({ user: id });
      if (cart) {
        const cartData = await Cart.findOne({ user: id })
          .populate("product.productId")
          .lean();
        if (cartData) {
          let total = 0;
          if (cartData.product.length) {
            total = getTotalPrice(cartData.product);
            res.render("cart", {
              user: req.session.name,
              data: cartData.product,
              userId: id,
              total: total,
            });
          } else {
            res.render("cart", { user: req.session.name, data2: "hi" });
          }
        } else {
          res.render("cart", { user: req.session.name, data2: "hi" });
        }
      } else {
        res.render("cart", {
          user: req.session.name,
          data2: "hi",
        });
      }
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log('getcart:-', error);
  }
};
const getTotalPrice = (products) => {
  let total = 0;
  products.forEach((product) => {
    total += product.price * product.quantity;
  });
  return total;
};

// // addToCart....................................
const addtocart = async (req, res) => {
  try {
    if (req.session.userId) {
      const productId = req.body.id;
      const id = req.session.userId;
      const userdata = await User.findOne({ _id: id });
      const userId = userdata._id;
      const productData = await Product.findById(productId);
      const userCart = await Cart.findOne({ user: userId });
      if (userCart) {
        const productIndex = userCart.product.findIndex(
          (product) => product.productId == productId
        );
        if (productIndex != -1) {
          userCart.product[productIndex].quantity += 1;
          await userCart.save();
          res.json({ success: true });
        } else {
          userCart.product.push({
            productId: productId,
            price: productData.price,
            quantity: 1,
          });
          await userCart.save();
          res.json({ success: true });
        }
      } else {
        const data = new Cart({
          user: userId,
          product: [
            {
              productId: productId,
              price: productData.price,
              quantity: 1,
            },
          ],
        });
        await data.save();
        res.json({ success: true });
      }
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//detete cart
const deleteCart = async (req, res) => {
  try {
    const id = req.body.id;
    const data = await Cart.findOneAndUpdate(
      { "product.productId": id },
      { $pull: { product: { productId: id } } }
    );
    if (data) {
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const addingAddress = async (req, res) => {
  try {
    if (req.session.userId) {
      const { name, state, town, houseAdress, pincode, phone } = req.body;
      const id = req.session.userId;
      const data = await User.findOneAndUpdate(
        { _id: id },
        {
          $push: {
            address: {
              firstname: name,
              state: state,
              town: town,
              houseAdress: houseAdress,
              pincode: pincode,
              phone: phone,
            },
          },
        },
        { new: true }
      );
      res.redirect("/checkout");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
}

const checkout = async (req, res) => {
  try {
    if (req.session.userId) {
      const Id = req.query.id;
      const data = await Product.findById(Id);
      const address = await User.findOne({ _id: req.session.userId });
      const id = address._id;
      const cartData = await Cart.findOne({ user: id }).populate("product.productId");

      if (cartData.product.length !== 0) {
        let total = 0;
        if (cartData.product.length) {
          for (let i = 0; i < cartData.product.length; i++) {
            const offers = await offerSchema.find({ status: 'Active', category: cartData.product[i].productId.category, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } })
            const proOffers = await productOfferSchema.find({ status: 'Active', product_name: cartData.product[i].productId._id, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } })
            if (offers.length && proOffers.length) {
              const res = Math.round(cartData.product[i].productId.price * (offers[0].discountPercentage + proOffers[0].discountPercentage) / 100)
              total = total + cartData.product[i].quantity * (cartData.product[i].productId.price - res)
            }
            else if (offers.length) {
              const res = Math.round(cartData.product[i].productId.price * offers[0].discountPercentage / 100)
              total = total + cartData.product[i].quantity * (cartData.product[i].productId.price - res)
            }
            else if (proOffers.length) {
              const res = Math.round(cartData.product[i].productId.price * proOffers[0].discountPercentage / 100)
              total = total + cartData.product[i].quantity * (cartData.product[i].productId.price - res)
            }
            else if (!offers.length && !proOffers.length) {
              total = total + cartData.product[i].quantity * cartData.product[i].productId.price;
            }
          }
          const Total = total;
          req.session.total = Total;
          const user = await User.findOne({
            _id: req.session.userId,
          });
          const userid = req.session.userId._id;
          length = req.session.length
          if (cartData.product && cartData.product.length > 0) {
            const total = await Cart.aggregate([
              {
                $match: { user: new mongoose.Types.ObjectId(userid) },
              },
              {
                $unwind: "$product",
              },
              {
                $project: {
                  price: "$product.price",
                  quantity: "$product.quantity",
                },
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: {
                      $multiply: ["$quantity", "$price"],
                    },
                  },
                },
              },
            ]).exec();
            res.render("checkout", {
              address: user.address,
              total: Total,
              wallet: user.wallet,
              users: cartData.product,
            });
          } else {
            console.log("There is nothing to checkout.");
          }
        }
      }

    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const confermation = async (req, res) => {
  try {
    const orderData = await Order.findOne().sort({ Date: -1 }).limit(1).populate('product.productId');
    const userId = orderData.user;
    res.render("orderplaced", { user: orderData });
  } catch (error) {
    console.log(error.message);
  }
};

const postPlaceOrder = async (req, res) => {
  try {
    if (req.session.userId) {
      const { address, payment, wallet, total } = req.body;
      const totalBefore = req.session.total
      const user = await User.findOne({
        _id: req.session.userId,
      });
      if (address === null) {
        res.json({ codFailed: true });
      }
      const cartData = await Cart.findOne({ user: user._id });
      const product = cartData.product;
      const status = payment == "cod" ? "Placed" : "pending";
      const orderNew = new Order({
        deliveryDetails: address,
        totalAmount: total,
        status: status,
        user: user._id,
        paymentMethod: payment,
        product: product,
        wallet: wallet,
        totalBefore: totalBefore,
        discount: 0,
        Date: new Date(),
        couponCode: "",
      });
      await orderNew.save();
      if (orderNew.status === 'Placed') {

        await User.findByIdAndUpdate(user._id,
          {
            $set: { wallet: wallet },
            $push: {
              wallehistory: {
                peramount: wallet,
                date: new Date().toISOString().substring(0, 10),
                transaction: "Debit",

              }
            }
          },
        );

      }
      let orderId = orderNew._id;
      if (orderNew.status == "Placed") {
        const couponData = await Coupon.findById(req.session.couponId);
        if (couponData) {
          let newLimit = couponData.limit - 1;
          await Coupon.findByIdAndUpdate(couponData._id, {
            limit: newLimit,
          });
        }
        let wall;
        if (orderNew.totalAmount >= user.wallet) {
          wall = 10;

          message = "Insufficient funds, using default wallet amount.";
        } else {
          wall = user.wallet - total;
          message = "Payment successful. Wallet balance updated.";
        }

        const result = await User.updateOne({ _id: user._id }, { $set: { wallet: wall } })
        console.log(result, 'sssssssssss');
        await Cart.deleteOne({ user: user._id });
        for (i = 0; i < product.length; i++) {
          const productId = product[i].productId;
          const quantity = Number(product[i].quantity);
          if (isNaN(quantity) || quantity <= 0) {
            console.error(`Invalid quantity for productId ${productId}`);
            continue;
          }
        }
        res.json({ codSuccess: true });
      } else {
        console.log('=-=-=-=-=');
        const options = {
          amount: total * 100,
          currency: 'INR',
          receipt: '' + orderId,
        };
        instance.orders.create(options, function (err, order) {
          console.log(order);
          if (err) {
            console.log(err);
          }
          res.json({ order });
        });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editaddress = async (req, res) => {
  try {
    if (req.session.userId) {
      const data = await User.findOne({
        _id: req.session.userId,
        "address._id": req.query.id,
      }).lean();

      res.render("editaddress", { user: data.address });
    }
  } catch (error) {
    console.log(error);
  }
};

const updateaddress = async (req, res) => {
  try {
    if (req.session.userId) {
      const addressId = req.body.id;
      console.log("🚀 ~ file: userController.js:963 ~ editpostaddress ~ addressId:", addressId);
      const userId = req.session.userId;
      const { name, state, town, houseAdress, pincode, phone } = req.body;
      await User.updateOne(
        { _id: userId, "address._id": addressId },
        {
          $set: {
            "address.$.name": name,
            "address.$.town": town,
            "address.$.state": state,
            "address.$.houseAdress": houseAdress,
            "address.$.pincode": pincode,
            "address.$.phone": phone
          },
        },
      );
      res.redirect("/checkout");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const deleteAddress = async (req, res) => {
  try {

    if (req.session.userId) {
      const userName = req.session.userId;
      const id = req.query.id;
      await User.updateOne(
        { _id: userName },
        {
          $pull: {
            address: {
              _id: id,
            },
          },
        }
      );
      res.redirect("/checkout");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const getOrder = async (req, res) => {
  console.log('order');
  try {
    if (req.session.userId) {
      const userData = await User.findById(req.session.userId);
      const orderNew = await Order.find({ user: userData._id }).populate("product.productId");
      res.render("order", { user: req.session.username, data: orderNew });
    } else {
      res.redirect("/home");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const singleOrder = async (req, res) => {
  try {
    if (req.session.userId) {
      const id = req.query.id;
      const idLength = id.length;
      if (idLength != 24) {
        res.redirect("/IdMismatch");
      } else {
        const orderData = await Order.findById(id).populate(
          "product.productId"
        );
        if (orderData == null) {
          res.redirect("/IdMismatch");
        } else {
          res.render("singleOrder", {
            data: orderData.product,
            orderData,
          });
        }
      }
    } else {
      res.redirect("/loginpage");
    }
  } catch (error) {
    res.redirect("/serverERR", { message: error.message });
    console.log(error.message);
  }
};

const changeQty = async (req, res) => {
  try {
    const userId = req.body.user;
    const productId = req.body.product;
    const value = Number(req.body.value);
    const stockAvailable = await Product.findById(productId);
    // const productOffer = await productOfferSchema.find({ status: 'Active', product_name: stockAvailable._id }).sort({ discountPercentage: 1 });
    // const offers = await offerSchema.find({ status: 'Active', category: stockAvailable.category._id }).populate('category').sort({ discountPercentage: 1 })
    if (stockAvailable.quantity >= value) {
      await Cart.updateOne(
        {
          user: userId,
          "product.productId": productId,
        },
        {
          $set: { "product.$.quantity": value },
        }
      );
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};


// apply coupon
const applycoupon = async (req, res) => {
  try {
    let code = req.body.code;
    let amount = req.body.amount;
    let userData = await User.find({ name: req.session.username });
    let userexist = await Coupon.findOne({
      couponcode: code,
      used: { $in: [userData._id] },
    });
    if (userexist) {
      const couponData = await Coupon.findOne({ couponcode: code });
      if (couponData) {
        if (couponData.expiredate >= new Date()) {
          if (couponData.limit != 0) {
            if (couponData.mincartamount <= amount && amount >= couponData.couponamount) {
              console.log('-0-0-0-0');
              let discountvalue1 = couponData.couponamount;
              let distotal = Math.round(amount - discountvalue1);
              let percentagevalue = (discountvalue1 / amount) * 100;
              const discountvalue = parseFloat(percentagevalue.toFixed(2));
              let couponId = couponData._id;
              req.session.couponId = couponId;
              res.json({
                couponokey: true,
                distotal,
                discountvalue,
                code,
              });
            } else {
              res.json({ cartamount: true });
            }
          } else {
            res.json({ limit: true });
          }
        } else {
          res.json({ expire: true });
        }
      } else {
        res.json({ invalid: true });
      }
    } else {
      res.json({ user: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verify online payment
const verifyPayment = async (req, res) => {
  try {
    if (req.session.userId) {
      let userData = await User.findOne({ users: req.session.username });
      const cartData = await Cart.findOne({ user: userData._id });
      const details = req.body;
      const crypto = require("crypto");
      let hmac1 = crypto.createHmac("sha256", '7wApZhaQBqJECM0mY6rjPE6U');
      console.log('---===--==', hmac1);
      hmac1.update(
        details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
      );
      await Cart.deleteOne({ user: userData._id });
      hmac1 = hmac1.digest("hex");
      if (hmac1 == details.payment.razorpay_signature) {
        let orderReceipt = details['order[receipt]'];
        const newOrder = await Order.find().sort({ date: -1 }).limit(1);
        const hai = newOrder.map((value) => {
          return value._id;
        });
        let test1 = await Order.findByIdAndUpdate(
          { _id: hai },
          { $set: { paymentId: details['payment[razorpay_payment_id]'] } }
        ).then((value) => {
          console.log(value);
        });
        let test2 = await Order.findByIdAndUpdate(orderReceipt, {
          $set: { status: "placed" },
        });
        res.json({ success: true });
      } else {
        await Order.deleteOne({ _id: details.order.receipt });
        res.json({ onlineSuccess: true });
      }
    } else {
      console.log("Ligin");
      res.redirect("/loginpage");
    }
  } catch (error) {
    res.render("500", { message: error.message });
    console.log(error.message);
  }
};

const laodcontcts = async (req, res) => {
  try {
    res.render('contacts')
  } catch (error) {
    console.log(error.meassage);
  }
}

//Whishlist...........................
const loadwishlist = async (req, res) => {
  try {
    if (req.session.userId) {
      const user = await User.findOne({ _id: req.session.userId });
      const id = user._id;
      const wish = await Wish.findOne({ user: id });
      if (wish) {
        const wishData = await Wish.findOne({ user: id })
          .populate("product.productId")
          .lean();
        if (wishData) {
          let total;
          if (wishData.product.length) {
            const total = await Wish.aggregate([
              {
                $match: { user: id },
              },
              {
                $unwind: "$product",
              },
              {
                $project: {
                  price: "$product.price",
                  quantity: "$product.quantity",
                  image: "$product.image",
                },
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: {
                      $multiply: ["$quantity", "$price"],
                    },
                  },
                },
              },
            ]).exec();
            const Total = total[0].total;
            wishData.product.forEach((element) => { });
            res.render("wishlist", {
              user: req.session.userId,
              data: wishData.product,
              userId: id,
              total: Total,

            });
          } else {
            res.render("wishlist", { user: req.session.name, data2: "hi" });
          }
        } else {
          res.render("wishlist", { user: req.session.name, data2: "hi" });
        }
      } else {
        res.render("wishlist", {
          user: req.session.name,
          data2: "hi",
        });
      }
    } else {
      res.redirect("/Login");
    }
  } catch (error) {
    console.log(error);
  }
};

// add to whish list
const addtowishlist = async (req, res) => {
  try {
    if (req.session.userId) {
      const productId = req.query.id;
      const userName = req.session.userId;
      const userdata = await User.findOne({ _id: userName });
      const userId = userdata._id;
      const productData = await Product.findById(productId);
      const userwish = await Wish.findOne({ user: userId });

      if (userwish) {
        const productExist = userwish.product.findIndex(
          (product) => product.productId == productId
        );

        if (productExist !== -1) {
          await Wish.findOneAndUpdate(
            { user: userId, "product.productId": productId },
            { $inc: { "product.$.quantity": 1 } }
          );
          res.json({ success: true });
        } else {
          await Wish.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                product: {
                  productId: productId,
                  price: productData.price,
                },
              },
            }
          );
          res.json({ status: true });
        }
      } else {
        const data = new Wish({
          user: userId,
          product: [
            {
              productId: productId,
              price: productData.price,
            },
          ],
        });
        await data.save();
        res.json({ status: true });
      }
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ status: false, error: error.message });
  }
};

const deletewish = async (req, res) => {
  try {
    const id = req.body.id;
    const data = await Wish.findOneAndUpdate(
      { "product.productId": id },
      { $pull: { product: { productId: id } } }
    );
    if (data) {
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};



module.exports = {
  loadHome,
  loadSignup,
  loginLoad,
  verifyLogin,
  insertUser,
  verifyOTP,
  loadOTP,
  resendOTP,
  sendOTP,
  Logout,
  blockuser,
  unblockuser,
  listProducts,
  detailproduct,
  detaileprofile,
  updateprofile,
  profileupdated,
  forgotPassword,
  updatePassword,
  forgotSubmit,
  updatePass,
  passForgotOtp,
  getcart,
  addtocart,
  deleteCart,
  checkout,
  forgotPass,
  confermation,
  addingAddress,
  editaddress,
  updateaddress,
  deleteAddress,
  postPlaceOrder,
  getOrder,
  singleOrder,
  changeQty,
  applycoupon,
  verifyPayment,
  laodcontcts,
  loadwishlist,
  addtowishlist,
  deletewish,

};


