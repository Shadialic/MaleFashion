const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({ 
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
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

offerSchema.pre('save', function (next) {
    const currentDate = new Date();
    if (this.endDate <= currentDate) {
        this.status = 'Expired';
    }
    next();
});
module.exports = mongoose.model('Offer', offerSchema);
