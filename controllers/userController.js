const User = require("../models/userModel")
const Product = require("../models/productModel")
const Category = require("../models/categoryModel")
const Brand = require("../models/brandModel")
const Banner = require("../models/bannerModel")
const Order = require('../models/orderModel')
const bcrypt = require("bcrypt");
const { Client } = require("twilio/lib/base/BaseTwilio");
const { banner } = require("./bannercontroller");

// Twilio
require('dotenv').config()
const accountsid = process.env.TWILIO_ACCOUNT_SID
const authtoken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountsid,authtoken)

// Load HomePage
const loadHome = async(req,res)=>{
    try {

        const productdata = await Product.find({status:true})
        const bannerdata = await Banner.find()
        const categorydata = await Category.find({status:true})
        if (productdata) {
            if (req.session.user_id) {
              const  session = req.session.user_id
               const  userdata = await User.findOne({ _id: session })
                res.render("userhome",{productData:productdata, categoryData: categorydata,bannerData:bannerdata,userData:userdata})
            } else {
                res.render('userhome',{productData:productdata, categoryData: categorydata,bannerData:bannerdata})
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Load LoginPage
const loadLogin = async(req,res)=>{
    try {
        res.render("userlogin")
    } catch (error) {
        console.log(error.message);
    }
}

// Load SignupPage
const loadSignup = async(req,res)=>{
    try {
        res.render("usersignup")
    } catch (error) {
        console.log(error.message);
    }
}

// Verifying The Login Page
const verifyLogin = async (req,res)=>{
    try{ 
         const email = req.body.email
         const password = req.body.password
         const userdata = await User.findOne({email:email})
         if(userdata){
             if (userdata.status) {
                req.session.user_id = userdata._id
                const passwordmatch = await bcrypt.compare(password,userdata.password)
            if(passwordmatch){
               req.session.user_id = userdata._id
                res.redirect('/')
            }else{
               res.render('userlogin',{message:'Email and password are incorrect'})
            }  
            }else {
                res.render('userlogin',{message:'You Have Been Blocked'})
            }
         } else if (password == '' && email == "") {
            res.render('userlogin',{message:'All Fields Are Required'})
         }else{
            res.render('userlogin',{message:'Enter a valid Username and Password'})
         }
    }
     catch(error){
          console.log(error.message);
     }
 }
 
// Verifying The Signup Page
const verifySignup = async(req,res)=>{
        req.session.userdata = req.body
        const found = await User.findOne({email:req.body.email})
        if(found){
            res.render('usersignup',{message:"Username Already Exists"})
        }else if(req.body.firstName == '' || req.body.lastName == ''||req.body.mobileNumber == ''||req.body.email == ''||req.body.password == '' ){
            res.render('usersignup',{message:"All Fields Are Required"})
        }else{
            mobilenumber = req.body.mobileNumber
            try {
                const otpResponse = await client.verify.v2
                .services('VA07d1bfacd5efbdbbbfd060fd714c5a26')
                .verifications.create({
                    to: `+91${mobilenumber}`,
                    channel:'sms'
                })
                    res.render('otppage')
            } catch (error) {
                console.log(error.message);
            }
        }
}

// Verifying The OTP
const verifyOtp = async(req,res)=>{
    const otp = req.body.otp;
    try{
        req.session.user
        const details = req.session.userdata
        const verifiedResponse = await client.verify.v2
        .services('VA07d1bfacd5efbdbbbfd060fd714c5a26')
        .verificationChecks.create({
            to :`+91${details.mobileNumber}`,
            code:otp,
        })
        if(verifiedResponse.status === 'approved'){
            details.password = await bcrypt.hash(details.password,10)
            const userdata = new User({
                firstname: details.firstName,
                lastname: details.lastName,
                email: details.email,
                password: details.password,
                mobilenumber: details.mobileNumber
            })
            const userData = await userdata.save();
            req.session.user = userData
            if(userdata){
                res.redirect('/login')
            }else{
                res.render('otppage',{message:"wrong otp"})
            }
        }else{
            res.render('otppage',{message:"wrong otp"})
        }
    }catch(error){
        console.log(error.message)
    }
}

// Loading Single Product Details
const productDetails = async (req, res) => {
    try {
        let id = req.params.id
        const productdata = await Product.findOne({_id:id,status:true}).populate('category')  
        const categorydata = await Category.find({status:true})
        if (req.session.user_id) {
            const session = req.session.user_id
            const userdata = await User.findOne({ _id: session })
            res.render('productdetails', { productData: productdata, categoryData: categorydata, userData:userdata })
        } else {
            res.render('productdetails',{productData:productdata,categoryData: categorydata })
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Loading Shopping Page
const allProducts = async (req, res) => {
    try {
        let page = 1;
        if (req.query.page) {
            page = req.query.page
        }
        const limit = 3
        const productdata = await Product.find({status:true}).populate('category').populate('brand')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()
        const categorydata = await Category.find({status:true})
        const productcount = await Product.find({}).countDocuments()
        let procount= Math.ceil(productcount/limit)
        const branddata = await Brand.find({status:true})
        if (req.session.user_id) {
            const session = req.session.user_id
            const userdata = await User.findOne({ _id: session })
            res.render('allproducts', { productData: productdata, categoryData: categorydata, productCount: procount, brandData: branddata ,userData:userdata })
        } else {
            res.render('allproducts', { productData: productdata, categoryData: categorydata, productCount: procount, brandData: branddata  })
        }
        } catch (error) {
        console.log(error.message);
    }
}

// CategoryWise Product Loading
const loadCategory = async (req, res) => {
    try {
        let page = 1;
        if (req.query.page) {
            page = req.query.page
        }
        const limit = 3
        const cataId = req.params.id
        const data = await Product.find({ category: cataId,status:true })
        .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()
        const categorycount = await Product.find({ category: cataId }).countDocuments()
        const categorydata = await Category.find({status:true})
        const branddata = await Brand.find({status:true})
        let procount= Math.ceil(categorycount/limit)
        if (req.session.user_id) {
            const session = req.session.user_id
            const userdata = await User.findOne({ _id: session })
            res.render('allproducts', { productData: data, categoryData: categorydata, brandData: branddata, productCount: procount,userData:userdata })
        } else {
            res.render('allproducts', { productData: data, categoryData: categorydata, brandData: branddata, productCount: procount})
        }
    } catch (error) {
        console.log(error.message);
    }
}

// BrandWise Product Loading
const loadBrand = async (req, res) => {
    try {
        let page = 1;
        if (req.query.page) {
            page = req.query.page
        }
        const limit = 3
        const braId = req.params.id
        const data = await Product.find({ brand: braId ,status:true})
        .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()
        const brandcount = await Product.find({ brand: braId }).countDocuments()
        const branddata = await Brand.find({status:true})
        const categorydata = await Category.find({status:true})
        let procount = Math.ceil(brandcount / limit)
        if (req.session.user_id) {
            const session = req.session.user_id
            const userdata = await User.findOne({ _id: session })
            res.render('allproducts', { productData: data, categoryData: categorydata, brandData: branddata, productCount: procount ,userData:userdata})
        } else {
            res.render('allproducts', { productData: data, categoryData: categorydata, brandData: branddata, productCount: procount })
        }
        } catch (error) {
        console.log(error.message);
    }
}

// User Profile
const userProfile = async (req, res) => {
    try {
        const id = req.session.user_id
        const userdata = await User.findOne({ _id: id })
        res.render('userprofile',{userData:userdata})
    } catch (error) {
        console.log(error.message);
    }
}

// Loading Edit Profile
const editProfile = async (req, res) => {
    try {
        const id = req.session.user_id
        const userdata = await User.findOne({ _id: id })
        res.render('editprofile',{userData:userdata})
    } catch (error) {
        console.log(error.message);
    }
}

// Updating Profile
const updateProfile = async (req, res) => {
    if (req.body.name.trim() == "" || req.body.mobileNumber.trim() == "" || req.body.email.trim() == '') {
        res.render('editprofile', { message: "All fields are required" })
    } else {
        try {
            const id = req.session.user_id
            const userdata = await User.updateOne({ _id: id }, {
                $set:
                {
                    firstname: req.body.name,
                    mobilenumber: req.body.mobileNumber,
                    email: req.body.email
                }
            })
            if (userdata) {
                res.redirect('/profile')
            }
        } catch (error) {
            console.log(error.message);
        }
    }
}

// Loading View Address
const viewAddress = async (req, res) => {
    try {
        const id = req.session.user_id
        const userdata = await User.findOne({ _id: id })
        res.render('viewaddress',{userData:userdata})
    } catch (error) {
        console.log(error.message);
    }
}

// Loading Add Address
const  addAddress = async(req,res)=>{
    try {
        const id = req.session.user_id
        const userdata = await User.findOne({ _id: id })
        res.render('addaddress',{userData:userdata})
    } catch (error) {
        console.log(error.message);
    }
}

// Inserting New Address
const newAddress = async (req, res) => {
    const id = req.session.user_id
    if(req.body.name.trim() == "" || req.body.housename.trim() == "" ||req.body.street.trim() == '' || req.body.district.trim() == "" || req.body.state.trim() == '' ||req.body.pincode.trim() == '' || req.body.country.trim() == '' ||req.body.phone.trim() == ''){
        res.render('addaddress',{message:"All fields are required"})
    }else{

    try {
        const address = await User.updateOne({ _id: req.session.user_id }, {
            $push: {
                address: {
                name:req.body.name,
                housename: req.body.housename,
                street:req.body.street,
                district:req.body.district,
                state:req.body.state,
                pincode:req.body.pincode,
                country: req.body.country,
                phone:req.body.phone}}
        })
        if(address){
            res.redirect('/viewaddress')
        }else{
            res.render('addaddress',{message:"action failed"})
        }
    } catch (error) {
        console.log(error.message);
    }
}
}

// Inserting New Address
const addingaddress = async (req, res) => {
    const id = req.session.user_id
    if(req.body.name.trim() == "" || req.body.housename.trim() == "" ||req.body.street.trim() == '' || req.body.district.trim() == "" || req.body.state.trim() == '' ||req.body.pincode.trim() == '' || req.body.country.trim() == '' ||req.body.phone.trim() == ''){
        res.render('addaddress',{message:"All fields are required"})
    }else{

    try {
        const address = await User.updateOne({ _id: req.session.user_id }, {
            $push: {
                address: {
                name:req.body.name,
                housename: req.body.housename,
                street:req.body.street,
                district:req.body.district,
                state:req.body.state,
                pincode:req.body.pincode,
                country: req.body.country,
                phone:req.body.phone}}
        })
        res.json({success:true})
    } catch (error) {
        console.log(error.message);
    }
}
}

// Loading Edit Address
const editAddress = async (req, res) => {
    try {
        const id = req.params.id
        const user = req.session.user_id
        const userdata = await User.findOne({'address._id':id },{'address.$':1})
        res.render('editaddress',{userData:userdata})
    } catch (error) {
        console.log(error.message);
    }
}

// Updating Address
const updateAddress = async (req, res) => {
    if(req.body.name.trim() == "" || req.body.housename.trim() == "" ||req.body.street.trim() == '' || req.body.district.trim() == "" || req.body.state.trim() == '' ||req.body.pincode.trim() == '' || req.body.country.trim() == '' ||req.body.phone.trim() == ''){
        res.render('addaddress',{message:"All fields are required"})
    }
    try {
        const id = req.params.id
        const user = req.session.user_id
        const userdata = await User.updateOne({ _id: user, 'address._id': id }, {
            $set: {
                'address.$': {
                    name: req.body.name,
                    housename: req.body.housename,
                    street: req.body.street,
                    district: req.body.district,
                    state: req.body.state,
                    pincode: req.body.pincode,
                    country: req.body.country,
                    phone: req.body.phone
                }
            }
        })
        if (userdata) {
            res.redirect('/viewaddress')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

// Deleting Address
const deleteAddress = async(req,res)=>{
    try {
        const id = req.session.user_id
        userdataId = req.body.userId
        const data = await User.updateOne({ _id: id },
        {$pull:{address:{_id:userdataId}}})
            if (data) {
                res.json({success:true})
        }      
    } catch (error) {
        console.log(error.message)
    }
}
// Load Order Page
const loadOrder = async (req, res) => {
    try {
        const id = req.session.user_id
        const userdata = await User.find({_id:req.session.user_id})
        const orderdata = await Order.find({userId:id}).populate('product.productId').sort({date:-1})
        res.render('order',{userData:userdata,orderData:orderdata})
    } catch (error) {
        console.log(error.message);
    }
}

// Cancel Order
const  cancelOrder = async (req, res) => {
    try {
        const orderId = req.body.orderId
        const cancel = await Order.updateOne({ _id: orderId }, { $set: { status: "Cancelled" } })
        const order = await Order.findOne({_id:orderId})
        //  Update the quantity of products
      for (let i = 0; i < order.product.length; i++) {
        await Product.updateOne({_id: order.product[i].productId}, {$inc: {stock: order.product[i].quantity}});
      }
        if (order.paymentType != "COD") {
            await User.updateOne({ _id: order.userId }, { $inc: { wallet: order.total } })
            res.json({success:true})
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Return Order
const returnOrder = async (req, res) => {
    try {
        const orderId = req.body.orderId
        const cancel = await Order.updateOne({ _id: orderId }, { $set: { status: "Return Requested" } })
        if (cancel) {
            res.json({success:true})
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Search
const search = async(req, res)=> {
    try {
        if (req.session.user_id) {
            const input = req.body.searched
            const result = new RegExp(input, 'i')
            const prod = await Product.find({name:result,status:true}).populate('category')
            const userData = await User.findOne({ _id: req.session.user_id })
            const categorydata = await Category.find({status:true})
            const branddata = await Brand.find({status:true})
            res.render('allproducts',{productData:prod,userData:userData,categoryData: categorydata,brandData: branddata })
        } else {
            const input = req.body.searched
            const result = new RegExp(input, 'i')
            const prod = await Product.find({ name: result,status:true }).populate('category')
            const userData = await User.findOne({ _id: req.session.user_id })
            const categorydata = await Category.find({status:true})
            const branddata = await Brand.find({status:true})
            res.render('allproducts',{productData:prod,userData:userData,categoryData: categorydata,brandData: branddata })
        } 
    } catch (error) {
        console.log(error.message);     
    }
} 

// Load ChangePassword
const loadChangepassword = async (req, res) => {
    try {
        res.render('changepassword')
    } catch (error) {
        console.log(error.message);
    }
}

// Changing Password
const changePassword = async (req, res) => {
    try {
        const id = req.session.user_id
        const userdata = await User.findOne({ _id: id })
        console.log(req.body);
        const oldvalue = req.body.old_password
        const newp = req.body.new_password
        const confirm = req.body.confirm_password
        const passwordmatch = await bcrypt.compare(oldvalue,userdata.password)
        if (passwordmatch) {
            if (newp == confirm) {
                conf1 = await bcrypt.hash(confirm,10)
                await User.updateOne({ _id:id }, { $set: { password: conf1 } })
                res.redirect('/profile')
            } else {
                res.render('userprofile',{userData:userdata,message:"Password Didn't Match"})
            }
        } else {
            res.render('userprofile',{userData:userdata,message:"Old Password is incorrect"})
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Load Forgot Password
const loadForgotPassword = async (req, res) => {
    try {
        res.render('forgotpassword')
    } catch (error) {
        console.log(error.message);
    }
}

// Forgot Password
const forgotpassword = async (req, res) => {
    try {
        const id = req.session.user_id
        const userdata = await User.findOne({ _id: id })
        const email = req.body.email
    } catch (error) {
        console.log(error.message);
    }
}

//
const loadWalletHistory = async (req, res) => {
    try {
        const id = req.session.user_id
        const orderdata = await Order.find({ userId: id }).sort({date:-1})
        res.render('wallet',{orderData:orderdata})
    } catch (error) {
        
    }
}
// User Logout
const userLogout = async(req,res)=>{
    try {
        req.session.user_id = null
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports ={
    loadHome,
    loadLogin,
    loadSignup,
    verifySignup,
    verifyLogin,
    verifyOtp,
    productDetails,
    allProducts,
    loadCategory,
    loadBrand,
    userProfile,
    editProfile,
    updateProfile,
    viewAddress,
    addAddress,
    newAddress,
    addingaddress,
    editAddress,
    updateAddress,
    deleteAddress,
    loadOrder,
    cancelOrder,
    returnOrder,
    search,
    loadChangepassword,
    changePassword,
    loadForgotPassword,
    forgotpassword,
    loadWalletHistory,
    userLogout,
}