const Category = require("../models/categoryModel")

// Loading Category Page 
const category = async(req,res)=>{
    try{
        const categorydata = await Category.find({})
        res.render('category',{categoryDatas :categorydata})
    }
    catch(error){
        console.log(error.message)
    }
}

// Loading Add Category Page
const addcategory = async(req,res)=>{
    try {
        res.render("addcategory")
    } catch (error) {
        console.log(error.message);
    }
}
            
// Adding New Category
const newcategory = async(req,res)=>{
    try {
        let bodyData = req.body.category
        bodyData = bodyData.trim()
        let cateData = bodyData.toUpperCase()
        let des = req.body.description
        const allData = await Category.findOne({category:cateData})
        if(allData){
            res.render("addcategory",{message:"This Category already exists"})
        }
        else if(bodyData=="" || des== ""){
            res.render("addcategory",{message:"All fields Are Required"})
        }else{
            const catdata = new Category({
                category : cateData,
                description : des
            })
            const categoryData = await catdata.save()
            if(categoryData){ 
               res.redirect("/admin/category")
            }
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Loading Edit Category Page
const editcategory = async(req,res)=>{
    try {
        const id = req.params.id
        const categoryData = await Category.findOne({_id:id})
        res.render('editcategory',{categorydata:categoryData})
    } catch (error) {
        console.log(error.message)
    }
}

// Editing A Category
const updatecategory = async(req,res)=>{
    try {
        let newData = req.body.category
        newData = newData.trim();
        let capData = newData.toUpperCase()
        let description = req.body.description
        let id = req.params.id
        const collectedData = await Category.findById({_id:id})
        const allCategory = await Category.findOne({category:capData})
        if (!newData || newData.length === 0 || !description || description.length === 0) {
            res.render('editCategory', { message: "All Fields Are Required", categorydata: collectedData });
        }else if(collectedData.category === capData){
            if(collectedData.description === description){
                res.render('editcategory',{message:"No changes made",categorydata:collectedData})
            }else{
                await Category.updateOne({_id:id},{$set:{category:capData,description:description}})
                res.redirect('/admin/category')
            }
        }else if(allCategory){
            res.render('editcategory',{message:"category already exists",categorydata:collectedData})
        }else{
            await Category.updateOne({_id:id},{$set:{category:capData,description:description}})
            res.redirect('/admin/category')
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Deleting A Category
// const deletecategory = async(req,res)=>{
//     try {
//         const id = req.params.id
//         await Category.deleteOne({_id:id})
//         res.redirect("/admin/category")
//     } catch (error) {
//         console.log(error.message)
//     }
// }

const categoryAction = async(req, res)=> {
    try {
        id = req.params.id
        const categorydata = await Category.findOne({ _id: id })
        if (categorydata.status) {
            await Category.updateOne({ _id: id },{$set:{status:false}})
        } else {
            await Category.updateOne({ _id: id },{$set:{status:true}})
        }
        res.redirect("/admin/category")
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    category,
    addcategory,
    newcategory,
    editcategory,
    updatecategory,
    // deletecategory
    categoryAction
}