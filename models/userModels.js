const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    referral: {
        type: String,
       
        unique: true
    },
    mobile: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    is_admin: {
        type: String,
        required: false
    },
    status: {
        type: Boolean,
        default: false
    },
    image: {
        type: Array,
        required: true
    },
    referralLink: {
        type: String
    },
   

    address: [{
        firstname: {
            type: String,
            required: true,

        },
        lastname: {
            type: String,
            required: true,

        },
        country: {
            type: String,
            required: true,

        },
        phone: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        town: {
            type: String,
            required: true,
        },
        houseAdress: {
            type: String,
            required: true,
        },
        district: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
    }],
    wallet: {
        type: Number,
        default: 0,
    },
    wallehistory: [{
        peramount: {
            type: Number,

        },
        date: {
            type: String
        },
        transaction: {
            type: String,
        },
    }]
})

userSchema.statics.isExistingEmail = async function (email) {
    try {
        const user = await this.findOne({ email });
        return !user; // Returns true if email doesn't exist, false otherwise
    } catch (error) {
        console.log('error is inside isExistingEmail', error.message);
        return false;
    }
}
userSchema.statics.isExistingUserName = async function (userName) {
    try {
        const user = await this.findOne({ username: userName });
        return !user; // Returns true if username doesn't exist, false otherwise
    } catch (error) {
        console.log('the error is in isExistingUsername function', error.message);
        return false;
    }
}

module.exports = mongoose.model('User', userSchema); 