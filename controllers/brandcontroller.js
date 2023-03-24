const Brand = require("../models/brandModel")

// Loading Brand Page
const brand = async(req,res)=>{
    try{
        const brandData = await Brand.find({})
        res.render('brands',{branddata :brandData})
    }
    catch(error){
        console.log(error.message)
    }
}

// Loading Add Brand Page
const addbrand= async(req,res)=>{
    try {
        res.render("addbrand")
    } catch (error) {
        console.log(error.message);
    }
}

// Adding A Brand
const newbrand = async(req,res)=>{
    try {
        let bodyData = req.body.brand
        bodyData = bodyData.trim()
        let cateData = bodyData.toUpperCase()
        let des = req.body.description
        const allData = await Brand.findOne({brand:cateData})
        if(allData){
            res.render("addbrand",{message:"This Brand already exists"})
        }
        else if(bodyData=="" || des== ""){
            res.render("addbrand",{message:"All fields Are Required"})
        }else{
            const catdata = new Brand({
                brand : cateData,
                description : des
            })
            const brandData = await catdata.save()
            if(brandData){ 
               res.redirect("/admin/brand")
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Loading Edit Brand Page
const editbrand = async(req,res)=>{
    try {
        const id = req.params.id
        const brandData = await Brand.findOne({_id:id})
        res.render('editbrand',{branddata:brandData})
    } catch (error) {
        console.log(error.message)
    }
}

// Editing Brand
const updatebrand = async(req,res)=>{
    try {
        let newData = req.body.brand
        newData = newData.trim();
        let capData = newData.toUpperCase()
        let description = req.body.description
        let id = req.params.id
        const collectedData = await Brand.findById({_id:id})
        const allBrand = await Brand.findOne({brand:capData})
        if (!newData || newData.length === 0 || !description || description.length === 0) {
            res.render('editbrand', { message: "All Fields Are Required", branddata: collectedData });
        }else if(collectedData.brand === capData){
            if(collectedData.description === description){
                res.render('editbrand',{message:"No changes made",branddata:collectedData})
            }else{
                await Brand.updateOne({_id:id},{$set:{brand:capData,description:description}})
                res.redirect('/admin/brand')
            }
        }else if(allBrand){
            res.render('editbrand',{message:"Brand already exists",branddata:collectedData})
        }else{
            await Brand.updateOne({_id:id},{$set:{brand:capData,description:description}})
            res.redirect('/admin/brand')
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Deleting Brand
// const deletebrand = async(req,res)=>{
//     try {
//         const id = req.params.id
//         await Brand.deleteOne({_id:id})
//         res.redirect("/admin/brand")
//     } catch (error) {
//         console.log(error.message)
//     }
// }

const brandAction = async(req, res)=> {
    try {
        id = req.params.id
        const branddata = await Brand.findOne({ _id: id })
        if (branddata.status) {
            await Brand.updateOne({ _id: id },{$set:{status:false}})
        } else {
            await Brand.updateOne({ _id: id },{$set:{status:true}})
        }
        res.redirect("/admin/brand")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    brand,
    addbrand,
    newbrand,
    editbrand,
    updatebrand,
    // deletebrand
    brandAction
}