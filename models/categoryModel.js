const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        unique:true,
    },
    status:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model("Category", categorySchema);
