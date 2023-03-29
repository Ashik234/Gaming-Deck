const Coupon = require('../models/couponModel')
const User = require('../models/userModel')

// Loading Coupon
const loadCoupon = async (req, res) => {
    try{
        const coupondata = await Coupon.find({})
        res.render("coupon",{couponData:coupondata})
    }
    catch(error){
        console.log(error.message)
    }
}

// Load Add Coupon
const loadAddCoupon = async (req, res) => {
    try {
        res.render('addcoupon')
    } catch (error) {
        console.log(error.message);
    }
}

// Adding New Coupon
const newCoupon = async (req, res) => {
    let bodyData = req.body.coupon
        bodyData = bodyData.trim()
    let coupData = bodyData.toUpperCase()
    const allData = await Coupon.findOne({coupon:coupData})
    if(req.body.coupon.trim() == "" || req.body.expiry == "" || req.body.minimumamount == '' ||req.body.maxdiscount == '' || req.body.percentage == ''){
        res.render('addcoupon',{message:"All Fields Are Required"})
    } else if (allData){
        res.render("addcoupon",{message:"This Coupon already exists"})
    }
    try {
        const coupon = new Coupon({
            coupon:req.body.coupon,
            expirydate: req.body.expiry,
            amount: req.body.minimumamount,
            maxdiscount:req.body.maxdiscount,
            percentage:req.body.percentage,
        })
        const couponData = await coupon.save()
        if(couponData){
            res.redirect('/admin/coupon')
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Loading Edit Coupon Page
const editCoupon = async(req,res)=>{
    try {
        const id = req.params.id
        const coupondata = await Coupon.findOne({_id:id})
        res.render('editcoupon',{couponData:coupondata})
    } catch (error) {
        console.log(error.message)
    }
}

// Editing Coupon
const updateCoupon = async (req, res) => {
    if (req.body.coupon == "" || req.body.expiry == "" || req.body.minimumamount == '' || req.body.discount == '' || req.body.percentage == '') {
        res.render('editcoupon',{message:"All Fields Are Required"})
    }
    const id=req.params.id
    await Coupon.updateOne({ _id: id }, {
        $set: {
            coupon: req.body.coupon,
            expirydate: req.body.expiry,
            amount: req.body.minimumamount,
            maxdiscount: req.body.maxdiscount,
            percentage: req.body.percentage,
        }
    })
    res.redirect('/admin/coupon')
}

// Apply Coupon
const applyCoupon = async (req, res, next) => {
    try {
        const couponDetails = await Coupon.findOne({ coupon: req.body.code })
        if (couponDetails) {
            const user = await User.findOne({ _id: req.session.user_id })  
            const found = await Coupon.findOne({ coupon: req.body.code, userUsed: { $in: [user._id] } })
            const code=couponDetails.coupon
            const datenow = Date.now()    
      if(found){
          res.json({used:true})
      } else {
          if (datenow <= couponDetails.expirydate) {
             if(couponDetails.amount<=req.body.total){
                 let discountAmount = req.body.total * couponDetails.percentage / 100
              if(discountAmount<=couponDetails.maxdiscount){
                  let discountValue = discountAmount
                  let value = req.body.total - discountValue
                 res.json({amountokay:true,value,discountValue,code})       
              }else{
                  let discountValue = couponDetails.maxdiscount
                  let value = req.body.total - discountValue
                  res.json({amountokay:true,discountValue,value,code})
              } 
             }else{
              res.json({amountnokay:true})
             }      
        }else{
           res.json({datefailed:true})
            }
            }
        } else {
          res.json({invalid:true})
        }
      } catch (error) {
         next(error)   
      }
}
// Deleting Coupon
const deleteCoupon = async(req,res)=>{
    try {
        const id = req.params.id
        await Coupon.deleteOne({_id:id})
        res.redirect("/admin/coupon")
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadCoupon,
    loadAddCoupon,
    newCoupon,
    editCoupon,
    updateCoupon,
    applyCoupon,
    deleteCoupon
}