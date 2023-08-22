const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;


const wishlistSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: "user",
        required: true, // Changed from "require" to "required"
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

const wish = mongoose.model("wish", wishlistSchema);
module.exports = wish;
