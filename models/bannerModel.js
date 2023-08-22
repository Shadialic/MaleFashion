const mongoose = require('mongoose');
const { array } = require('../middlewere/multer')

const bannerSchema = mongoose.Schema({
    heading: {
        type: String,
        required: true
    },
    discription: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('banner', bannerSchema)