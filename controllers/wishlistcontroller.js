const User = require("../models/userModel")

// Load Wishlist
const loadWishlist = async (req, res) => {
    try {
        const  session = req.session.user_id
        const productData = await User.findOne({ _id: session }).populate("wishlist.product")
        if (req.session.user_id) {
            const session = req.session.user_id
            const userdata = await User.findOne({ _id: session })
            res.render('wishlist', { productdata: productData,userData:userdata })
        } else {
            res.render('wishlist', { productdata: productData})
        }
        } catch (error) {
        console.log(error.message);
    }
}

// Adding To Wishlist
const addWishlist = async(req, res)=> {
    try {
        userId = req.session.user_id
        proId = req.body.productId
        console.log(req.body.productId);
        const data = await User.findOne({ _id: userId, "wishlist.product": proId })
        if (data) {
            res.json({success:true})
        } else {
            const insert = await User.updateOne({ _id: userId },
                { $push: { wishlist: { product: proId } } })
                if (insert) {
                    res.json({success:true})
            }
        }       
    } catch (error) {
        console.log(error.message);
    }
}

// Adding Product From Wishlist To Cart
const addtoCart = async (req, res) => {
    try {
        const id = req.session.user_id
        proId = req.body.productId
        proPrice = req.body.price
        const data = await User.findOne({ _id: id, "cart.product": proId })
        if (data) {
            res.json({success:false})
        } else {
            const insert = await User.updateOne({ _id: id },
                { $push: { cart: { product: proId , quantity: 1,prototalprice:proPrice} } })
                const update = await User.updateOne({ _id: id },
                    { $pull: { wishlist: { product: proId } } })
                if (insert) {
                    res.json({success:true})
                }
                const cart = await User.findOne({ _id: req.session.user_id })
            let sum = 0
            for (let i = 0; i < cart.cart.length; i++){
                sum = sum + cart.cart[i].prototalprice
            }
            const updated = await User.updateOne({ _id: req.session.user_id }, { $set: { carttotalprice: sum } })
            res.json({success:true})
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Deleting From Wishlist
const deletWish = async (req, res) => {
    try {
        const id = req.session.user_id
        proId = req.body.productId
        const data = await User.updateOne({ _id: id },
        {$pull:{wishlist:{product:proId}}})
            if (data) {
                res.json({success:true})
        }      
    } catch (error) {
        console.log(error.message);
    }
}
    
module.exports = {
    loadWishlist,
    addWishlist,
    addtoCart,
    deletWish
}