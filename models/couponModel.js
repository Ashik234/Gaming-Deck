const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema({
    coupon: {
        type: String,
        required:true
    },
    expirydate: {
        type: Date,
        required:true
    },
    amount: {
        type: Number,
        required:true,
    },
    maxdiscount: {
        type: Number,
        required:true
    }, 
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max:100
    },
    userUsed:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
})
module.exports = mongoose.model('Coupon',couponSchema)