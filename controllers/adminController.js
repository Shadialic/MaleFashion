const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const categorycollection = require("../models/categoryModel");
const productModel = require("../models/productModel");
const Order = require("../models/orderModel");


const loadLogin = async (req, res) => {
  try {
    res.render('adminlogin')
  } catch (error) {
    console.log(error.message);
  }

}

const verifyAdmin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (email === process.env.ADMIN_EMAIL) {
      const passwordMatch = process.env.ADMIN_PASS === password ? true : false;
      if (passwordMatch) {
          res.redirect('/admin/adminHome');
      } else {
        res.render('adminlogin', { message: 'Email and password incorrect' });
      }
    } else {
      res.render('adminlogin', { message: 'Username or password is incorrect' });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const loadDashboard = async (req, res) => {
  try {
    const orderData = await Order.find({ status: { $ne: "cancelled" } });
    let SubTotal = 0;
    orderData.forEach(function (value) {
      SubTotal = SubTotal + value.totalAmount;
    });
    const cod = await Order.find({ paymentMethod: "cod" }).count();
    console.log("-------------------", cod);
    const online = await Order.find({ paymentMethod: "online" }).count();
    const totalOrder = await Order.find({ status: { $ne: "cancelled" } }).count();
    const totalUser = await User.find().count();
    const totalProducts = await productModel.find().count();
    const date = new Date();
    const year = date.getFullYear();
    const currentYear = new Date(year, 0, 1);
    const salesByYear = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: currentYear },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%m", date: "$createdAt" } },
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    let sales = [];
    for (i = 1; i < 13; i++) {
      let result = true;
      for (j = 0; j < salesByYear.length; j++) {
        result = false;
        if (salesByYear[j]._id == i) {
          sales.push(salesByYear[j]);
          break;
        } else {
          result = true;
        }
      }
      if (result) {
        sales.push({ _id: i, total: 0, count: 0 });
      }
    }
    let yearChart = [];
    for (let i = 0; i < sales.length; i++) {
      yearChart.push(sales[i].total);
    }
    const userData = await User.find({ is_admin: '0' });
    res.render('adminHome', {
      users: userData,
      data: orderData,
      total: SubTotal,
      cod,
      online,
      totalOrder,
      totalUser,
      totalProducts,
      yearChart,
    });
  } catch (error) {
    console.log(error.message);
  }
}

const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err.message);
      }
      res.redirect('/admin');
    });
  } catch (error) {
    console.log(error.message);
    res.redirect('/admin');
  }
};

const userTable = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const userData = await User.find({
      $or: [
        { username: { $regex: '.*' + search + '.*' } },
        { email: { $regex: '.*' + search + '.*' } },
        { mobile: { $regex: '.*' + search + '.*' } }
      ]
    });

    res.render('users', { users: userData })
  } catch (error) {
    console.log(error.message);
  }
}

const loadProduct = async (req, res) => {
  try {
    res.render('product');

  } catch (error) {
    console.log(error.message);
  }
}

const loadcategory = async (req, res) => {
  try {
    res.render('category')
  } catch (error) {
    console.log(error.message);
  }
}

// /getSales Report
const getSalesReport = async (req, res) => {
  try {
    let start;
    let end;
    req.query.start ? (start = new Date(req.query.start)) : (start = "ALL");
    req.query.end ? (end = new Date(req.query.end)) : (end = "ALL");
    if (start != "ALL" && end != "ALL") {
      const data = await Order.aggregate([
        {
          $match: {
            $and: [
              { Date: { $gte: start } },
              { Date: { $lte: end } },
              { status: { $eq: "Delivered" } },
            ],
          },
        },
      ]);
      let SubTotal = 0;
      data.forEach(function (value) {
        SubTotal = SubTotal + value.totalAmount;
      });
      res.render("salesreport", { data, total: SubTotal });
    } else {
      const orderData = await Order.find({ status: { $eq: "Delivered" } });
      let SubTotal = 0;
      orderData.forEach(function (value) {
        SubTotal = SubTotal + value.totalAmount;
      });
      res.render("salesreport", { data: orderData, total: SubTotal });
    }
  } catch (error) {
    res.redirect("/serverERR", { message: error.message });
    console.log(error.message);
  }
};

module.exports = {
  loadLogin,
  verifyAdmin,
  loadDashboard,
  logout,
  userTable,
  loadProduct,
  loadcategory,
  getSalesReport
}