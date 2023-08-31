const { redirect } = require('express/lib/response');
const Category = require('../models/categoryModel');
const nodemailer = require('nodemailer');



// show category
const loadcategory = async (req, res) => {
    try {
        let search = "";
        if (req.query.search) {
            search = req.query.search;
        }
        const categories = await Category.find({

            $or: [
                { category: { $regex: '.*' + search + '.*' } }

            ]
        });
        res.render('category', { category: categories });
    } catch (error) {
        console.log(error.message);
    }
}

// addcategory
const addcategory = async (req, res) => {
    try {
        res.render('addcategory')

    } catch (error) {
        console.log(error.message);
    }
}

const categoryadd = async (req, res) => {
    try {
        const category = req.body.category;
        const existingCategory = await Category.findOne({
            category: { $regex: category, $options: "i" },
        });
        if (existingCategory) {
            res.render("addcategory", { message: "Category already exists" });
        } else {
            const result = await Category.create({ category: category });
            if (result) {
                res.redirect('/admin/category')
            }
        }
    } catch (error) {
        console.log(error.message);
    }

}

const editcategory = async (req, res) => {
    try {
        const category = await Category.findById({ _id: req.query.id })
        res.render('edit-category', { category })
    } catch (error) {
        console.log(error.message);
    }
}

const updatedcategory = async (req, res) => {
    try {
        const id = req.query.id;
        console.log(req.query.id);
        if (id) {
            await Category.updateOne({ _id: id }, {
                $set: {
                    category: req.body.category,
                }
            })
            console.log(req.body.category);
            res.redirect('/admin/category')
        }

    } catch (error) {
        console.log(error.message);
    }
}

// // delete category
const deletecategory = async (req, res) => {
    try {
      const category = req.query.id
      const deleted = await Category.deleteOne({ _id: category })
        if (deleted) {
            res.redirect('/admin/category')
        } else {
            res.status(404).render('404')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const unlistCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const data = await Category.findOne({ _id: id });
        if (data.status == false) {
            await Category.findOneAndUpdate(
                { _id: id },
                { $set: { status: true } }
            );
        } else {
            await Category.findOneAndUpdate(
                { _id: id },
                { $set: { status: false } }
            );
        }
        res.redirect("/admin/category");
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    loadcategory,
    addcategory,
    categoryadd,
    editcategory,
    updatedcategory,
    deletecategory,
    unlistCategory
}