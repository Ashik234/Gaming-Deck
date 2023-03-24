const mongoose = require('mongoose');
const bannerSchema = new mongoose.Schema({
    banner: {
        type: String,
        required:true
    },
    image: {
        type: String,
        required:true
    }

})
module.exports = mongoose.model('banner',bannerSchema);