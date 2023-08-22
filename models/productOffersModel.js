const mongoose = require('mongoose');

const productOfferSchema = mongoose.Schema({
    product_name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        default: 'Active',
    },
});
productOfferSchema.pre('save', function (next) {
    const currentDate = new Date();
    if (this.endDate <= currentDate) {
        this.status = 'Expired';
    }
    next();
});

module.exports = mongoose.model('productOffer', productOfferSchema);
