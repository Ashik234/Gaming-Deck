const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    mobilenumber:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    address: [{
        name: {
            type: String,
            required:true
        },
        housename: {
            type: String,
            required:true
        },
        street: {
            type: String,
            required:true
        },
        district: {
            type: String,
            required:true
        },
        state: {
            type: String,
            required:true
        },
        pincode: {
            type: String,
            required:true
        },
        country: {
            type: String,
            required:true
        },
        phone: {
            type: Number,
            required:true
        },
    }],
    status:{
        type:Boolean,
        default:true
    },
    wishlist: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required:true
        }
    }],
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required:true
        },
        quantity:{
            type: Number,
            default:1
        },
        prototalprice: {
            type: Number,
        },
    }],  
    carttotalprice: {
        type: Number 
    },
    wallet:{
        type: Number,
    }
})
module.exports = mongoose.model('User',userSchema)