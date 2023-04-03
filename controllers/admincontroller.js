const admin = require("../models/adminModel");
const User = require("../models/userModel")
const Product = require("../models/productModel")
const Category = require("../models/categoryModel")
const Order = require('../models/orderModel')

// Loading Login Page
const loadLogin = async(req,res)=>{
    try{
        res.render("adminlogin");
    }
    catch(error){
        console.log(error.message);
    }
}

// Verifying Login
const verifyLogin = async (req,res)=>{
    try{
        const name = req.body.name
        const password = req.body.password
        const adminData = await admin.findOne({name:name})
        if(adminData){
            if(password===adminData.password){
                req.session.admin_id = adminData._id
                res.redirect('/admin/dashboard')
            }else{
                res.render('adminlogin',{message:"Email and password are incorrect"})
            }
        }else if(name=="" && password==""){
            res.render("adminlogin",{message:"Email and Password required"})
        }else{
            res.render("adminlogin",{message:"Enter a valid username"})
        } 
    }
    catch(error){
         console.log(error.message)
    }
}

// Loading Dashboard
const loadDashboard = async(req,res)=>{
    try {
        const userorder = await Order.find({}).populate('product.productId').populate('userId').sort({date:-1}).limit(10)
        const userdata = await User.find({}).count()
        const orderdata = await Order.find({ status: "Delivered" }).count()
        const confirmed = await Order.find({ status: "Confirmed" }).count()
        const delivered = await Order.find({ status: "Delivered" }).count()
        const shipped = await Order.find({ status: "Shipped" }).count()
        const cancelled = await Order.find({ status: "Cancelled" }).count()
        const returned = await Order.find({ status: "Returned" }).count()
        const UPI = await Order.find({ paymentType: "UPI", status: "Delivered" }).count()
        const COD = await Order.find({ paymentType: "COD", status: "Delivered" }).count()
        const WALLET = await Order.find({ paymentType: "WALLET", status: "Delivered" }).count()
        const revenueOfTheWeekly = await Order.aggregate([
            {
              $match: {
                date: {
                  $gte: new Date(new Date().setDate(new Date().getDate() - 7)) 
                }, status: {
                  $eq: "Delivered"
                }
              }
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$total" }
              }
            }
          ])
          const weeklyRevenue = revenueOfTheWeekly.map((item) => {
            return item.totalAmount;
          })
        const salesChart = await Order.aggregate([
            {
              $match: {
                status: {
                  $eq: "Delivered"
                }
              }
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                sales: { $sum: "$total" },
              }
            },
            {
              $sort: { _id: 1 }
            },
            {
              $limit: 7
            }
          ])
          const date = salesChart.map((item) => {
            return item._id;
          })
          const sales = salesChart.map((item) => {
            return item.sales;
          })
        
        res.render("dashboard",{userOrder:userorder,userData:userdata,orderData:orderdata,date,sales,confirmed,delivered,shipped,cancelled,returned,UPI,COD,WALLET,weeklyRevenue});
    } 
    catch (error){
        console.log(error.message)
    }
}

// Loading Sales Report Date 
const salesReports = async (req, res, next) => {
    try {
      res.render('sales')
    } catch (error) {
      next(error);
    }
}
  
// Loading Sales Report
const loadSalesReport = async (req, res) => {
    try {
    // create a new date object with the existing date
    const existingDate = new Date(req.body.to);

    // add one day to the existing date
    const newDate = new Date(existingDate);
    newDate.setDate(existingDate.getDate() + 1);
        if (req.body.from == "" || req.body.to == "") {
            res.render('sales', { message: 'All Fields Are Required' })
        } else {
            const ss = await Order.find({
                status: "Delivered", date: {
                    $gte: new Date(req.body.from),
                    $lte: new Date(newDate)
                }
            }).populate("product.productId")
            res.render("salesreport", { ss });
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Loading Users
const loadUser = async(req,res)=>{
    try{
        const userdata = await User.find({})
        res.render("users",{userdatas:userdata})
    }
    catch(error){
        console.log(error.message)
    }
}

// User's Blocking / UnBlocking
const userAction = async (req, res) => {
    try {
        id = req.params.id
        const userdata = await User.findOne({ _id: id })
        if (userdata.status) {
            await User.updateOne({ _id: id }, { $set: { status: false } })
            req.session.user_id = null
        } else {
            await User.updateOne({ _id: id },{$set:{status:true}})
        }
        res.redirect("/admin/users")
    } catch (error) {
        console.log(error.message);
    }
}

// Loading Product Details Page
const productDetails = async (req, res) => {
    try {
        let id = req.params.id
        const productdata = await Product.findOne({_id:id}).populate('category').populate('brand')  
        const categorydata = await Category.find({})
        res.render('productdetails',{productData:productdata,categoryData:categorydata})
    } catch (error) {
        console.log(error.message);
    }
}

// Loading Orders
const loadOrder = async (req, res) => {
    try {
        const userdata = await User.find({})
        const orderdata = await Order.find({}).populate('product.productId').sort({date:-1})
        res.render("orders",{userData:userdata,orderData:orderdata})
    }
    catch(error){
        console.log(error.message)
    }
}

// Load Order Details
const loadOrderDetails = async (req, res) => {
    try {
        let id = req.params.id
        const orderdata = await Order.findOne({_id:id}).populate('product.productId')
        res.render('orderdetails',{orderData:orderdata})
    } catch (error) {
        console.log(error.message);
    }
}

// Updating Order Status
const updateStatus = async (req,res)=>{
    try {
        const ordId = req.body.orderId
        const status = req.body.newStatus
        const update = await Order.updateOne({ _id: ordId }, { $set: { status: status } })
        if (update) {
            const order = await Order.findOne({_id:ordId})
        //  Update the quantity of products
      for (let i = 0; i < order.product.length; i++) {
        await Product.updateOne({_id: order.product[i].productId}, {$inc: {stock: order.product[i].quantity}});
      }
        if (order.paymentType != "COD") {
            await User.updateOne({ _id: order.userId }, { $inc: { wallet: order.total } })
            res.json({success:true})
        }
        }
        res.json({success:true})
    } catch (error) {
        console.log(error.message);
    }
}

// Admin Logout
const logout = async(req,res)=>{
    try {
        req.session.admin_id = null
        res.redirect('/admin/')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    salesReports,
    loadSalesReport,
    loadUser,
    userAction,
    productDetails,
    loadOrder,
    loadOrderDetails,
    updateStatus,
    logout,
}

