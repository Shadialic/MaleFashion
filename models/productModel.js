const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId;

const productSchema = new mongoose.Schema({
    productname: {
        type: String,
        required: true
    },
    category: {
        type:ObjectId,
        ref: 'Category',
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true
    },
    image: {
        type: Array,
        required: true
    },
    stock: {
        type: Boolean,

    },
    status: {
        type: Boolean,
        default: false,
    }
})
module.exports = mongoose.model('products', productSchema)


