const express = require("express");
const user_route = express();

// Bodyparser
const bodyParser = require("body-parser")
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:false}))

// view engine setup
user_route.set('view engine', 'ejs')
user_route.set('views','./views/user')

// Middleware
const auth = require("../middleware/userauth")

// Controllers
const usercontroller = require("../controllers/userController")
const cartcontroller = require("../controllers/cartcontroller")
const wishlistcontroller = require("../controllers/wishlistcontroller")
const ordercontroller = require('../controllers/ordercontroller')
const couponcontroller = require('../controllers/couponcontroller')

// USER ROUTE GET
user_route.get("/",usercontroller.loadHome)
user_route.get("/login",auth.isLogout,usercontroller.loadLogin)
user_route.get("/signup",auth.isLogout,usercontroller.loadSignup)
user_route.get('/logout',auth.isLogin,usercontroller.userLogout)
user_route.get('/productdetails/:id', usercontroller.productDetails)
user_route.get('/allproducts', usercontroller.allProducts)
user_route.get('/category/:id', usercontroller.loadCategory)
user_route.get('/brands/:id', usercontroller.loadBrand)
user_route.get('/profile',auth.isLogin, usercontroller.userProfile)
user_route.get('/editprofile', usercontroller.editProfile)
user_route.get('/viewaddress', auth.isLogin,usercontroller.viewAddress)
user_route.get('/addaddress', usercontroller.addAddress)
user_route.get('/editaddress/:id', usercontroller.editAddress)
user_route.get('/changepassword', usercontroller.loadChangepassword)
user_route.get('/forgotpassword', usercontroller.loadForgotPassword)
user_route.get('/wallethistory', auth.isLogin,usercontroller.loadWalletHistory)
user_route.get('/orders', auth.isLogin, usercontroller.loadOrder)
user_route.get('/orderdetails/:id',auth.isLogin,usercontroller.loadOrderDetails)

// USER ROUTE POST
user_route.post("/signup",usercontroller.verifySignup)
user_route.post("/login",usercontroller.verifyLogin)
user_route.post('/verifyotp', usercontroller.verifyOtp)
user_route.post('/editprofile', usercontroller.updateProfile)
user_route.post('/editaddress/:id',usercontroller.updateAddress)
user_route.post('/addaddress', usercontroller.newAddress)
user_route.post('/deleteaddress', usercontroller.deleteAddress)
user_route.post('/cancelorder', usercontroller.cancelOrder)
user_route.post('/returnorder', usercontroller.returnOrder)
user_route.post("/addingaddress", usercontroller.addingaddress)
user_route.post('/search', usercontroller.search)
user_route.post('/changepassword', usercontroller.changePassword)

// Cart GET
user_route.get('/cart', auth.isLogin, cartcontroller.loadCart)
user_route.get('/checkout',auth.isLogin, cartcontroller.loadCheckout)

// Cart POST
user_route.post('/addtocart', cartcontroller.addtoCart)
user_route.post('/adjustquantity',cartcontroller.adjustQuantity)
user_route.post('/deletecart', cartcontroller.deletCart)

// Wishlist GET
user_route.get('/wishlist',auth.isLogin, wishlistcontroller.loadWishlist)

// Wishlist POST
user_route.post('/addtowishlist', wishlistcontroller.addWishlist)
user_route.post('/wishtocart', wishlistcontroller.addtoCart)
user_route.post('/deletewish', wishlistcontroller.deletWish)

// Order GET
user_route.get('/ordersuccess', auth.isLogin, ordercontroller.loadOrderSuccess)

// Order POST
user_route.post('/placeorder',ordercontroller.placeOrder)
user_route.post('/applycoupon',couponcontroller.applyCoupon)
user_route.post('/verify-payment',ordercontroller.PaymentVerified)

user_route.use(function (req, res, next) {
    res.render('404');
});

module.exports = user_route
