const Product = require('../models/productModel')
const Category = require("../models/categoryModel");
const upload = require("../middlewere/multer")
const session = require('express-session');
const { default: mongoose } = require('mongoose');


const loadProduct = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const productData = await Product.find({
      $or: [
        { productname: { $regex: '.*' + search + '.*' } },
        { brand: { $regex: '.*' + search + '.*' } },
      ]
    }).populate('category');
    res.render('product', { Product: productData });
  } catch (error) {
    console.log(error.message);
  }
};

const productadd = async (req, res) => {
  try {
    const category = await Category.find({})
    res.render('addproduct', { category })
  } catch (error) {
    console.log(error.message);
  }
}

const addproduct = async (req, res) => {
  try {


    const { productname, brand, price, description, quantity, category1 } = req.body;
     
            const existingProduct = await Product.findOne({ productname: productname });
            const category = await Category.find().populate("category").lean();
            if (existingProduct) {
                return res.render("addproduct",{category, message: 'Product with the same name already exists' });
            }if (price <0 || quantity <0) {
                return res.render( "addproduct",{category, message: 'negetive value not support'});
    }
    const img = req.files.map((image) => image.filename);
    const products = new Product({

      productname: req.body.productname,
      brand: req.body.brand,
      price: req.body.price,
      description: req.body.description,
      quantity: req.body.quantity,
      category: req.body.category1,
      image: img,
    });
    const productdata = await products.save();
    if (productdata) {
      res.redirect("/admin/product");
    }
  } catch (error) {
    console.log(error);
  }
};


const poductedit = async (req, res) => {
  try {
    const category = await Category.find().populate("category").lean();
    const id = req.query.id;
    const productData = await Product.findOne({ _id: id }).lean();
    if (productData) {
      res.render("editproduct", {
        user: productData,
        category: category,
      });
    } else {
      res.redirect("/admin/editproduct");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const editedproduct = async (req, res) => {
  try {
    console.log(req.body);
    if (req.files) {
      const existingProduct = await Product.findById(req.query.id);
      let images = existingProduct.image;
      req.files.forEach((file) => {
        images.push(file.filename);
      });
    }
    const {
      productname,
      brand,
      price,
      description,
      quantity,
      categoryId,
      img,
    } = req.body;
    await Product.updateOne(
      { _id: req.query.id },
      {
        $set: {
          productname,
          brand,
          price,
          description,
          quantity,
          category: categoryId,
          image: img,
        },
      }
    );
    res.redirect("/admin/product");
  } catch (error) {
    console.log(error.message);
  }
};

const removeimage = async (req, res) => {
  try {
    let id = req.body.id;
    let position = req.body.position;
    let productImg = await Product.findById(id);
    let image = productImg.image[position];
    productImg.image.splice(position, 1);
    await productImg.save();
    res.json({ remove: true });
  } catch (error) {
    res.render("admin/500");
    console.log(error);
  }
};

const unlistproduct = async (req, res) => {
  const id = req.query.id;
  const data = await Product.findById({ _id: id });
  if (data.status == true) {
    await Product.findOneAndUpdate(
      { _id: id },
      { $set: { status: false } }
    );
  } else {
    await Product.findOneAndUpdate(
      { _id: id },
      { $set: { status: true } }
    );
  }
  res.redirect("/admin/product");
};

const deleteproduct = async (req, res) => {
  try {
    const product = req.query.id;
    const deleted = await Product.deleteOne({ _id: product })
    if (deleted) {
      res.redirect('/admin/product')
    } else {
      console.log('404');
    }
  } catch (error) {

    console.log(error.message);
  }
}

module.exports = {
  loadProduct,
  productadd,
  addproduct,
  poductedit,
  editedproduct,
  removeimage,
  unlistproduct,
  deleteproduct

}

