const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    orderId: {
        type: String,
        unique: true,
        required: true,
    },
    deliveryaddress: {
        type: String,
        required:true
    },
    date: {
        type: Date,
       
    },
    product: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required:true
        },
        quantity: {
            type: Number,
            required:true
        },
        singleTotal: {
            type: Number,
            required:true
        }
    }],
    total: {
        type:Number
    },
    discount: {
        type:Number
    },
    paymentType: {
        type: String,
        required:true
    },
    status: {
        type: String,
        default:'pending'
    }
})
module.exports = mongoose.model('Order',orderSchema)


