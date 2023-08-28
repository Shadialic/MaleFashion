const Coupon = require("../models/coupenModel");

//getcoupen----------
const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.find();
        res.render("coupon", { data: coupon });
    } catch (error) {
        console.log(error.message);
    }
};

//get addcoupen-----------
const getaddcoupon = async (req, res) => {
    try {
        res.render("addcoupon");
    } catch (error) {
        console.log(error.message);
    }
};

//postaddcoupon--------------
const postaddcoupon = async (req, res) => {
    try {
       

        let coupons = Coupon({
            couponcode: req.body.name,
            couponamounttype: req.body.coupontype,
            couponamount: req.body.amount,
            mincartamount: req.body.mincart,
            maxredeemamount: req.body.maxredeem,
            expiredate: req.body.date,
            limit: req.body.limit,
        });
        // const coupon = await Coupon.findOne()
        // if (couponamount <0 ) {
        //     return res.render("addcoupon",{ message: 'negetive value not support'});
        // }
        await coupons.save();
        res.redirect("/admin/coupon");
    } catch (error) {
        console.log(error.message);
    }
};

//detete coupen-------
const deleteCoupon = async (req, res) => {
    try {
        const code = req.query.code;
        await Coupon.findOneAndDelete({ couponcode: code });
        res.redirect("/admin/coupon");
    } catch (error) {
        console.log(error.message);
    }
};

const editcoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({ couponcode: req.query.id });
        res.render('editcoupon', { coupon })
    } catch (error) {
        console.log(error.message);
    }
}
const updatedcoupon = async (req, res) => {
    try {
        console.log('Updating coupon...');

        const id = req.query.id;

        if (!id) {
            console.log('Missing ID in query parameter');
            return res.status(400).send('Missing coupon ID');
        }
        console.log('Updating coupon with ID:', id);
        const {
            couponcode,
            couponamount,
            mincartamount,
            expiredate,
        } = req.body;

        console.log('Updating with data:', req.body);
        const updateResult = await Coupon.findByIdAndUpdate(
            id, 
            {
                $set: {
                    couponcode,
                    couponamount,
                    mincartamount,
                    expiredate,
                },
            },
            { new: true }
        );
        
        if (!updateResult) {
            console.log('Coupon not found');
            return res.status(404).send('Coupon not found');
        }

        console.log('Update result:', updateResult);

        res.redirect('/admin/coupon');
    } catch (error) {
        console.log('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    getCoupon,
    getaddcoupon,
    postaddcoupon,
    deleteCoupon,
    editcoupon,
    updatedcoupon

}