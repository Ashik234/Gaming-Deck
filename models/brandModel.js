const mongoose = require("mongoose")
const brandSchema = new mongoose.Schema({
    brand:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    status: {
        type:Boolean,
        default:true
    }
})
module.exports = mongoose.model('Brand',brandSchema)