const express = require("express");
const  admin_route = express();

// BodyParser
const bodyParser = require("body-parser")
admin_route.use(bodyParser.json())
admin_route.use(bodyParser.urlencoded({extended:false}))

// View Engine
admin_route.set('view engine','ejs')
admin_route.set('views','./views/admin')

const path = require('path')

// Multer
const multer = require('multer')
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/productimages'))
    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.originalname
        cb(null,name)
    }
})
const upload = multer({storage:storage})

// Middleware
const auth = require("../middleware/auth")

// Controllers
const admincontroller = require("../controllers/admincontroller")
const categorycontroller = require("../controllers/categorycontroller")
const productcontroller = require("../controllers/productcontroller");
const brandcontroller = require("../controllers/brandcontroller");
const bannercontroller = require("../controllers/bannercontroller");
const couponcontroller = require("../controllers/couponcontroller")


// Admin Route GET
admin_route.get("/",auth.isLogout,admincontroller.loadLogin)
admin_route.get("/dashboard", auth.isLogin, admincontroller.loadDashboard)
admin_route.get('/sales', auth.isLogin,admincontroller.salesReports)
admin_route.get("/users", auth.isLogin, admincontroller.loadUser)
admin_route.get("/action/:id", admincontroller.userAction)
admin_route.get('/productdetails/:id', admincontroller.productDetails)
admin_route.get("/logout",auth.isLogin,admincontroller.logout)

// Admin Route POST
admin_route.post("/", admincontroller.verifyLogin)
admin_route.post('/salesreport', auth.isLogin,admincontroller.loadSalesReport)


// Category Route GET
admin_route.get("/category",auth.isLogin,categorycontroller.category)
admin_route.get("/addcategory",auth.isLogin,categorycontroller.addcategory)
admin_route.get('/editcategory/:id', auth.isLogin, categorycontroller.editcategory)
admin_route.get("/categoryaction/:id", categorycontroller.categoryAction)
// admin_route.get('/category/:id',auth.isLogin,categorycontroller.deletecategory)

// Category Route POST
admin_route.post("/addcategory",categorycontroller.newcategory)
admin_route.post("/editcategory/:id",categorycontroller.updatecategory)

// Product Route GET
admin_route.get("/products",auth.isLogin,productcontroller.product)
admin_route.get("/addproduct",auth.isLogin,productcontroller.addproduct)
admin_route.get("/editproduct/:id",auth.isLogin,productcontroller.editproduct)
// admin_route.get("/products/:id", auth.isLogin, productcontroller.deleteproduct)
admin_route.get("/productaction/:id", productcontroller.productAction)
admin_route.get('/deleteimg/:imgid/:prodid',auth.isLogin,productcontroller.deleteImage)

// Product Route POST
admin_route.post("/addproduct",upload.array('image'),productcontroller.newproduct)
admin_route.post('/editproduct/:id', upload.array('image'), productcontroller.updateproduct)
admin_route.post('/editproduct/updateimage/:id',upload.array('image'),productcontroller.updateImage)
    
// Brand Route GET
admin_route.get('/brand',auth.isLogin,brandcontroller.brand)
admin_route.get("/addbrand",auth.isLogin,brandcontroller.addbrand)
admin_route.get('/editbrand/:id', auth.isLogin, brandcontroller.editbrand)
admin_route.get("/brandaction/:id", brandcontroller.brandAction)
// admin_route.get('/brand/:id', auth.isLogin, brandcontroller.deletebrand)

// Brand Route POST
admin_route.post("/addbrand",brandcontroller.newbrand)
admin_route.post("/editbrand/:id",brandcontroller.updatebrand)

// Banner Route GET
admin_route.get('/banner',auth.isLogin,bannercontroller.banner)
admin_route.get("/addbanner", auth.isLogin, bannercontroller.addbanner)
admin_route.get('/editbanner/:id', auth.isLogin, bannercontroller.editbanner)
admin_route.get('/banner/:id', auth.isLogin, bannercontroller.deletebanner)

// Banner Route POST
admin_route.post("/addbanner",upload.single('image'),bannercontroller.newbanner)
admin_route.post("/editbanner/:id",upload.single('image'),bannercontroller.updatebanner)

// Order Route GET
admin_route.get('/order', auth.isLogin, admincontroller.loadOrder)
admin_route.get('/orderdetails/:id',auth.isLogin,admincontroller.loadOrderDetails)

// Order Route POST
admin_route.post('/updateStatus', auth.isLogin, admincontroller.updateStatus)

// Coupon Route GET
admin_route.get('/coupon', auth.isLogin, couponcontroller.loadCoupon)
admin_route.get('/addcoupon', auth.isLogin, couponcontroller.loadAddCoupon)
admin_route.get('/editcoupon/:id', auth.isLogin, couponcontroller.editCoupon)
admin_route.get('/coupon/:id', auth.isLogin, couponcontroller.deleteCoupon)

// Coupon Route Post
admin_route.post("/addcoupon",couponcontroller.newCoupon)
admin_route.post("/editcoupon/:id",couponcontroller.updateCoupon)

// 404
admin_route.use(function (req, res, next) {
    res.render('404');
});

module.exports = admin_route;