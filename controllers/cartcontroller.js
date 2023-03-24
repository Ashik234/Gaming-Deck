const User = require("../models/userModel")

// Loading Cart Page
const loadCart = async (req, res) => {
    try {
        const  session = req.session.user_id
        const productData = await User.findOne({ _id: session }).populate("cart.product")
        if (req.session.user_id) {
            const session = req.session.user_id
            const userdata = await User.findOne({ _id: session })
            res.render('cart', { productdata: productData, userData: userdata })
        } else {
            res.render('cart', { productdata: productData})
        }
        } catch (error) {
        console.log(error.message);
    }
}

// Adding To Cart
const addtoCart = async (req, res) => {
    try {
        userId = req.session.user_id
        proId = req.body.productId
        proPrice = req.body.price
        const data = await User.findOne({ _id: userId, "cart.product": proId })
        if (data) {
            res.json({success:true})
        } else {
            const insert = await User.updateOne({ _id: userId },
                { $push: { cart: { product: proId , quantity: 1, prototalprice:proPrice} } })
                if (insert) {
                    res.json({success:true})
            }
        }
        const cart = await User.findOne({ _id: req.session.user_id })
            let sum = 0
            for (let i = 0; i < cart.cart.length; i++){
                sum = sum + cart.cart[i].prototalprice
            }
            const update = await User.updateOne({ _id: req.session.user_id }, { $set: { carttotalprice: sum } })
            res.json({success:true})
    } catch (error) {
        console.log(error.message);
    }
}

// Deleting From Cart
const deletCart = async (req, res) => {
    try {
        const id = req.session.user_id
        proId = req.body.productId
        const data = await User.updateOne({ _id: id },
        {$pull:{cart:{product:proId}}})
        if (data) {
            const cart = await User.findOne({ _id: req.session.user_id })
            let sum = 0
            for (let i = 0; i < cart.cart.length; i++){
                sum = sum + cart.cart[i].prototalprice
            }
            const update = await User.updateOne({ _id: req.session.user_id }, { $set: { carttotalprice: sum } })
                res.json({success:true})
        }      
    } catch (error) {
        console.log(error.message);
    }
}

// Changing Quantity
const adjustQuantity = async (req, res) => {
    try {
        if (req.session.user_id) {
            const proId = req.body.productId
            const count = req.body.count
            const price = req.body.price

            const adjustQuantity = await User.updateOne({ _id: req.session.user_id, 'cart.product': proId }, { $inc: { 'cart.$.quantity': count } })
            
            const quantity = await User.findOne({ _id: req.session.user_id, 'cart.product': proId }, { _id: 0, 'cart.quantity.$': 1 })
            
            const qnty = quantity.cart[0].quantity
            const prodsingleprice = price * qnty
            await User.updateOne({ _id: req.session.user_id, 'cart.product': proId }, { $set: { 'cart.$.prototalprice': prodsingleprice } })

            const cart = await User.findOne({ _id: req.session.user_id })
            let sum = 0
            for (let i = 0; i < cart.cart.length; i++){
                sum = sum + cart.cart[i].prototalprice
            }
            const update = await User.updateOne({ _id: req.session.user_id }, { $set: { carttotalprice: sum } })
            res.json({success:true,prodsingleprice,sum})
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Loadng Checkout Page
const loadCheckout = async (req, res) => {
    try {
        const  session = req.session.user_id
        const productData = await User.findOne({ _id: session }).populate("cart.product")
        const userdata = await User.findOne({ _id: session })
            res.render('checkout',{productdata: productData, userData: userdata })
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadCart,
    addtoCart,
    deletCart,
    adjustQuantity,
    loadCheckout
}