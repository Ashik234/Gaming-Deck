const Product = require("../models/productModel")
const Category = require("../models/categoryModel")
const Brand = require("../models/brandModel")
const { category } = require("./categorycontroller")
const mongoose =require('mongoose')
const fs = require("fs")
const path = require("path")

// Loading Product Page
const product = async(req,res)=>{
    try{
        const productdata = await Product.find({})
        .populate("brand")
        .populate("category")
        res.render('products', { productDatas: productdata })
    }
    catch(error){
        console.log(error.message)
    }
}

// Loading Add Product Page
const addproduct = async(req,res)=>{
    try {
        const category = await Category.find({})
        const brand = await Brand.find({})
        res.render('addproduct',{categorydata:category,branddata:brand})
    } catch (error) {
        console.log(error.message);
    }
}

// Adding New Product
const newproduct = async(req,res)=>{
    if(req.body.productname.trim() == "" || req.body.category.trim() == "" || req.body.description.trim() == '' ||req.body.stock.trim() == '' || req.body.price.trim() == '' ||req.body.offerprice.trim() == '' ||req.body.brand.trim() == ''){
        const categoryData = await Category.find({})
        const brandData = await Brand.find({})
        res.render('addproduct',{categorydata:categoryData,branddata:brandData,message:"All fields are required"})
    }else{
        if (!req.files || !req.files.length) {
            const categoryData = await Category.find({})
            const brandData = await Brand.find({})
            res.render('addproduct',{categorydata:categoryData,branddata:brandData,message:"Please select at least one image"})
        } else if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
            const categoryData = await Category.find({})
            const brandData = await Brand.find({})
            res.render('addproduct',{categorydata:categoryData,branddata:brandData,message:"Invalid Category Selected"})
        } 
    try {
        const imagearray = [];
        for(file of req.files){
            imagearray.push(file.filename)
        }
        const product = new Product({
            name:req.body.productname,
            price: req.body.price,
            offerprice:req.body.offerprice,
            description:req.body.description,
            image:imagearray,
            category:req.body.category,
            stock:req.body.stock,
            brand:req.body.brand
        })
        const productData = await product.save()
        if(productData){
            res.redirect('/admin/products')
        }else{
            res.render('addproduct',{message:"action failed"})
        }
    } catch (error) {
        console.log(error.message);
    }
}
}

// Loading Editing Product Page
const editproduct = async (req, res) => {
        try {
            const id = req.params.id
            const productData = await Product.findOne({_id:id}).populate("category").populate("brand")
            const categoryData = await Category.find({})
            const brandData = await Brand.find({})
            res.render('editproduct',{productdata:productData,categorydata:categoryData,branddata:brandData})
        } catch (error) {
            console.log(error.message)
        }
    }

// Editing Product
const updateproduct = async (req, res) => {
    if (req.body.product == "" || req.body.category == "" || req.body.description == '' ||req.body.stock == '' || req.body.price == '' || req.body.offerprice == '' ||req.body.brand == '') {
        const id = req.params.id
            const productData = await Product.findOne({_id:id}).populate("category").populate("brand")
            const categoryData = await Category.find({})
            const brandData = await Brand.find({})
            res.render('editproduct',{productdata:productData,categorydata:categoryData,branddata:brandData,message:"All Fields Are Required"})
    } else {
    try {
        const imagearray = [];
        for(file of req.files){
            imagearray.push(file.filename)
        }
        if(imagearray!=""){
            const id=req.params.id
            await Product.updateOne({_id:id},{$set:{
                name:req.body.product,
                image:imagearray,
                category:req.body.category,
                description:req.body.description,
                stock:req.body.stock,
                price: req.body.price,
                offerprice:req.body.offerprice,
                brand:req.body.brand
        }})
        res.redirect('/admin/products')
    }else{
        const id=req.params.id
        await Product.updateOne({_id:id},{$set:{
            name:req.body.product,
            category:req.body.category,
            description:req.body.description,
            stock:req.body.stock,
            price: req.body.price,
            offerprice:req.body.offerprice,
            brand:req.body.brand
    }})
    res.redirect('/admin/products')
    }
    } catch (error) {
        console.log(error.message);
        }
    }
}

// Deleting An Image 
const deleteImage = async (req, res) => {
    try {
        const imgid = req.params.imgid
        const prodid = req.params.prodid
        fs.unlink(path.join(__dirname, "/productimages/", imgid), () => { })
        const productimg = await Product.updateOne({ _id: prodid }, { $pull: { image: imgid } })
        res.redirect('/admin/editproduct/'+prodid)
    } catch (error) {
        console.log(error.message);
    }
}

// Inserting An Image
const updateImage = async (req, res) => {
    try {
        const id = req.params.id
        const prodata = await Product.findOne({ _id: id })
        const imglength = prodata.image.length
        
        if (imglength <= 3) {
            let images = []
            for (file of req.files) {
                images.push(file.filename)
            }
            if (imglength + images.length <= 3) {
                const updatedata = await Product.updateOne({ _id: id }, { $addToSet: { image: { $each: images } } })
                res.redirect("/admin/editproduct/"+id)
            } else {
                const productData = await Product.findOne({ _id: id }).populate("category")
                const categoryData = await Category.find()
                const brandData = await Brand.find({})
                res.render('editproduct',{productdata:productData,categorydata:categoryData,branddata:brandData,imgfull:true})
            }
        } else {
            res.redirect("/admin/editproduct/"+id)
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Deleting A Product
// const deleteproduct = async(req,res)=>{
//     try {
//         const id = req.params.id
//         await Product.deleteOne({_id:id})
//         res.redirect("/admin/products")
//     } catch (error) {
//         console.log(error.message);
//     }
// }

const productAction = async(req, res)=> {
    try {
        id = req.params.id
        const productdata = await Product.findOne({ _id: id })
        if (productdata.status) {
            await Product.updateOne({ _id: id },{$set:{status:false}})
        } else {
            await Product.updateOne({ _id: id },{$set:{status:true}})
        }
        res.redirect("/admin/products")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    product,
    addproduct,
    newproduct,
    editproduct,
    updateproduct,
    deleteImage,
    updateImage,
    // deleteproduct
    productAction
}