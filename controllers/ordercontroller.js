const Order = require('../models/orderModel')
const User = require('../models/userModel')
const Product = require('../models/productModel')
const Coupon = require('../models/couponModel')
const { v4: uuidv4 } = require('uuid');
const Razorpay = require('razorpay');
const crypto=require('crypto');

require('dotenv').config()
var instance = new Razorpay({
  key_id:process.env.KEY_ID,
  key_secret:process.env.KEY_SECRET,
});

// Placing Order
const placeOrder = async (req, res) => { 
    try {
            const orderdata = req.body;
                let productarray = []
            
                if (!Array.isArray(orderdata.productId)) {
                    orderdata.productId = [orderdata.productId]
                }
      
                if (!Array.isArray(orderdata.quantity)) {
                    orderdata.quantity = [orderdata.quantity]
                }
            
                if (!Array.isArray(orderdata.singleTotal)) {
                    orderdata.singleTotal = [orderdata.singleTotal]
                }

                for (let i = 0; i < orderdata.productId.length; i++) {
                    const productId = orderdata.productId[i]
                    const quantity = orderdata.quantity[i]
                    const singleTotal = orderdata.singleTotal[i]
                    productarray.push({ productId: productId, quantity: quantity, singleTotal: singleTotal })
                }
     
                let method = req.body.paymentType
            if (method == "COD") {
                if (req.body.address == null) {
                    res.json({address:true})
                }
                const status = req.body.paymentType == 'COD' ? 'Confirmed' : 'Pending'
                const order = new Order({
                    userId: req.body.userId,
                    deliveryaddress: req.body.address,
                    product: productarray,
                    total: req.body.total,
                    paymentType: req.body.paymentType,
                    orderId: `order_id_${uuidv4()}`, // generate a custom order ID using uuid
                    status: status,
                    discount: req.body.discount1
                })
                const productdata = await order.save()
                await Coupon.updateOne({ coupon: req.body.code }, { $push: { userUsed: userId } })
                const cartdeletion = await User.updateOne(
                    { _id: req.session.user_id }, {
                    $pull: { cart: { product: { $in: orderdata.productId } } },
                    $set: { carttotalprice: 0 },
                }
                );

                for (let i = 0; i < productarray.length; i++) {
                    const product = await Product.findById(productarray[i].productId)
                    product.stock = product.stock - productarray[i].quantity
                    await product.save()
                }
                res.json({ status: true })

                // UPI     
            } else if (method == "UPI") {
                if (req.body.address == null) {
                    res.json({address:true})
                }
                const order = new Order({
                    userId: req.body.userId,
                    deliveryaddress: req.body.address,
                    product: productarray,
                    total: req.body.total,
                    paymentType: req.body.paymentType,
                    orderId: `order_id_${uuidv4()}`, // generate a custom order ID using uuid
                    status: "Payment Failed",
                    discount: req.body.discount1
                })
                const productdata = await order.save()
                await Coupon.updateOne({ coupon: req.body.code }, { $push: { userUsed: userId } })
                
                

              
       
                const latestOrder = await Order.findOne({}).sort({ date: -1 }).lean();
 
                if (latestOrder) {
                    let options = {
                        amount: orderdata.total * 100,
                        currency: "INR",
                        receipt: "" + latestOrder._id
                    };
                    instance.orders.create(options,function(err,order){
                        res.json({viewRazorpay:true,order})  
                    });
                } else {
                    console.log("Latest order not found.");
                    res.json({ viewRazorpay: false }); // or handle the error as per your requirement
                }

                // WALLET
            } else if (method == "WALLET") {
                if (req.body.address == null) {
                    res.json({address:true})
                }
                let userdata = await User.findOne({ _id: req.session.user_id });
                const order = new Order({
                    userId: req.body.userId,
                    deliveryaddress: req.body.address,
                    product: productarray,
                    total: req.body.total,
                    paymentType: req.body.paymentType,
                    orderId: `order_id_${uuidv4()}`, // generate a custom order ID using uuid
                    status: "Confirmed",
                    discount: req.body.discount1
                })
                const productdata = await order.save()
                await Coupon.updateOne({ coupon: req.body.code }, { $push: { userUsed: userId } })
                
                const cartdeletion = await User.updateOne(
                    { _id: req.session.user_id }, {
                    $pull: { cart: { product: { $in: orderdata.productId } } },
                    $set: { carttotalprice: 0 },
                }
                );

                for (let i = 0; i < productarray.length; i++) {
                    const product = await Product.findById(productarray[i].productId)
                    product.stock = product.stock - productarray[i].quantity
                    await product.save()
                }
                
                // Reduce wallet balance
                const balance = userdata.wallet - req.body.total1;
                const walletMinus = await User.updateOne({ _id: req.session.user_id },{ $set: { wallet: balance } });
                res.json({ status: true })
            }
    } catch (error) {
        console.log(error.message);
    }
}

// Verify Payment 
const PaymentVerified= async(req,res)=>{
  try {
   if(req.session.user_id){      
       const details = req.body
       let hmac=crypto.createHmac('sha256',process.env.KEY_SECRET)
       hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]'])
       hmac=hmac.digest('hex')
       
       if(hmac==details['payment[razorpay_signature]']){
         const latestOrder = await Order.findOne({}).sort({ date: -1 }).lean();
           const change = await Order.updateOne({ _id: latestOrder._id }, { $set: { status: "Confirmed" } })
            res.json({status:true})
       }else{
         console.log("Fail");
            res.json({failed:true})
       }
   }else{
     res.redirect('/login')
   }
  } catch (error) {
   console.log(error.message);
  } 
}

// Load Order Success
const loadOrderSuccess = async (req, res) => {
    try {
        const userdata = await User.findOne({_id:req.session.user_id})
        const orderdata = await Order.findOne({ userId: req.session.user_id }).sort({ date: -1 }).lean().populate('product.productId')
        
        if(orderdata.paymentType == "UPI"){
        const cartdeletion = await User.updateOne(
            { _id: req.session.user_id }, {
            $pull: { cart: { product: { $in: orderdata.productId } } },
            $set: { carttotalprice: 0 },
        }
        );
        let productarray = []
        for (let i = 0; i < productarray.length; i++) {
            const product = await Product.findById(productarray[i].productId)
            product.stock = product.stock - productarray[i].quantity
            await product.save()
            }
        }
        res.render('success', { userData: userdata, orderData: orderdata })
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    placeOrder,
    PaymentVerified,
    loadOrderSuccess
}