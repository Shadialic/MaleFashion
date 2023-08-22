const Order = require('../models/orderModel')
const User = require('../models/userModels')
const Product = require('../models/productModel');

const getOrder = async (req, res) => {
    try {
        const orderData = await Order.find();
        res.render("orders", { data: orderData });
    } catch (error) {
        console.log(error.message);
    }
};

const viewOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        const orderData = await Order.findById(orderId).populate(
            "product.productId"
        );
        const userId = orderData.user;
        const userData = await User.findById(userId);
        res.render("singleOrder", { orderData, userData });
    } catch (error) {
        console.log(error.message);
    }
};
const cancelOrder = async (req, res) => {
    try {
        const orderId = req.query.id
        const order = await Order.findById(orderId)
        order.status = 'cancelled'
        order.save()
        res.redirect('/order')
    } catch (error) {
        console.log(error.message);
        res.render('500')
    }
}
//rerturn order
const returnOrder = async (req, res) => {
    try {
        if (req.session.userId) {
            const id = req.query.id;
            const orderData = await Order.findById(id);
            const amount = await User.findOne({ _id: req.session.userId });
            const total = amount.wallet + orderData.totalAmount;
            const date = new Date().toDateString();
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const orderDate = new Date(orderData.Date);
            if (orderDate < twoWeeksAgo) {
                throw new Error("Cannot return order after 2 weeks.");
            }

            if (
                orderData.paymentMethod == "cod" ||
                orderData.paymentMethod == "online"
            ) {
                // Add the order total back to the user's wallet
                const updatedUser = await User.findOneAndUpdate(
                    { _id: req.session.userId },
                    {
                        $set: { wallet: total }, // Add walletUpdatedTime field
                        $push: {
                            wallehistory: {
                                peramount: orderData.totalAmount,
                                date: new Date().toISOString().substring(0, 10),
                                transaction: "Credited",
                            }
                        }
                    },
                    { new: true } // Return the updated user document
                );
                const orderDataa = await Order.findByIdAndUpdate(id, {
                    status: "returned",
                    wallet: 0,
                });

                if (orderDataa) {
                    res.redirect("/order");
                }
            }
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        res.redirect("/serverERR", { message: error.message });
        console.log(error.message);
    }
};
//order status update------------------------------
const updatestatus = async (req, res) => {
    try {
        const status = req.body.status;
        const orderId = req.body.orderId;
        await Order.findByIdAndUpdate(orderId, { status: status });
        res.redirect("/admin/orders");
    } catch (error) {
        console.log(error.message);
    }
};

const checkWallet = async (req, res) => {
    try {
        if (req.session.userId) {
            const userData = await User.findById(req.session.userId);
            const walleta = userData.wallet;
            console.log('wallet', walleta);
            if (walleta > 0) {
                res.json({ success: true, walleta });
            }
        } else {
            res.redirect("/checkout");
        }
    } catch (error) {
        res.redirect("/serverERR", { message: error.message });
        console.log(error.message);
    }
};

//report downlod---------------------------
const report = async (req, res) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto("http://localhost:3000/salesreport", {
            waitUntil: "networkidle2",
        });
        await page.setViewport({ width: 1680, height: 1050 });
        const todayDate = new Date();
        const pdfn = await page.pdf({
            path: `${path.join(
                __dirname,
                "../public/files",
                todayDate.getTime() + ".pdf"
            )}`,
            format: "A4",
        });
        await browser.close();
        const pdfUrl = path.join(
            __dirname,
            "../public/files",
            todayDate.getTime() + ".pdf"
        );
        res.set({
            "Content-Type": "application/pdf",
            "Content-Length": pdfn.length,
        });
        res.sendFile(pdfUrl);
    } catch (error) {
        console.log(error.message);
    }
};


module.exports = {
    getOrder,
    cancelOrder,
    viewOrder,
    checkWallet,
    updatestatus,
    returnOrder,
    report
}