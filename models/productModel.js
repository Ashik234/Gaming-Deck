const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    description:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    offerprice:{
        type:Number,
        required:true
    },
    brand:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Brand",
        required:true
    },
    status: {
        type:Boolean,
        default:true
    }
})
module.exports = mongoose.model('Product',productSchema)