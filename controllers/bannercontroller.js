const Banner = require("../models/bannerModel");

// Loading Banner Page
const banner = async(req,res)=>{
    try{
        const bannerData = await Banner.find({})
        res.render('banner',{bannerdata :bannerData})
    }
    catch(error){
        console.log(error.message)
    }
}

// Loading Add Banner Page
const addbanner= async(req,res)=>{
    try {
        res.render("addbanner")
    } catch (error) {
        console.log(error.message);
    }
}

// Adding A Banner
const newbanner = async(req,res)=>{
    try {
        const banner = new Banner({
            banner : req.body.banner,
            image:req.file.filename
        })
        const newbanner = await banner.save()
        if (newbanner) {
            res.redirect('/admin/banner')
        }
    } catch (error) {
        console.log(error.message);
    }
}

// Loading Edit Banner Page
const editbanner = async(req,res)=>{
    try {
        const id = req.params.id
        const bannerData = await Banner.findOne({_id:id})
        res.render('editbanner',{bannerdata :bannerData})
   } catch (error) {
        console.log(error.message);
   }
}

// Editing Banner
const updatebanner = async(req,res)=>{
    try {
       const id = req.params.id
       const banner = await Banner.updateOne({ _id: id }, {
           $set: {
               banner: req.body.banner,
               image: req.file.filename
           }
       })
       if (banner) {
    res.redirect('/admin/banner')
}
   } catch (error) {
    console.log(error.message);
   }
}

// Deleting Banner
const deletebanner = async(req,res)=>{
    try {
        const id = req.params.id
        await Banner.deleteOne({_id:id})
        res.redirect("/admin/banner")
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    banner,
    addbanner,
    newbanner,
    editbanner,
    updatebanner,
    deletebanner
}