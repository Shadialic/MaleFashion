const Banner = require('../models/bannerModel')

// getBanner-----------------------
const getBanner = async (req, res) => {
    try {
        const bannerData = await Banner.find();
        res.render("banners", { data: bannerData });
    } catch (error) {
        console.log(error.message);
    }
};

//addBanner----------------------
const getAddBanner = async (req, res) => {
    try {
        res.render("add-banner");
    } catch (error) {
        console.log(error.message);
    }
};

//post add banner-------------------
const postAddBanner = async (req, res) => {
    try {
        const heading = req.body.heading;
        const discription = req.body.discription;
        const image = req.file.filename;

        const data = new Banner({
            heading: heading,
            discription: discription,
            image: image,
        });

        const result = await data.save();
        if (result) {
            res.redirect("/admin/banners");
        }
    } catch (error) {
        console.log(error);
    }
};
//unlist banner--------
const unlistBanner = async (req, res) => {
    try {
        const id = req.query.id;
        const data = await Banner.findById(id);
        if (data.status == true) {
            await Banner.findByIdAndUpdate(id, { status: false });
        } else {
            await Banner.findByIdAndUpdate(id, { status: true });
        }
        res.redirect("/admin/banners");
    } catch (error) {
        console.log(error.message);
    }
};
//delete banner-----------
const deletebanner = async (req, res) => {
    try {
        const id = req.query.id;
        await Banner.deleteOne({ _id: id });
        res.redirect("/admin/banners");
    } catch (error) {
        console.log(error.message);
    }
};

module.exports={
    getBanner,
    getAddBanner,
    postAddBanner,
    unlistBanner,
    deletebanner

}