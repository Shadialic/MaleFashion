const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const cartSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: "user",
        required: true,
    },
    product: [{
        productId: {
            type: ObjectId,
            ref: "products",
            required: true,
        },
        quantity: {
            type: Number,
            default: 1
        },
        price: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type: Number,
            default: 0
        }

    }]
});

const cart = mongoose.model("Cart", cartSchema);
module.exports = cart;
