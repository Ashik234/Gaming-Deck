const mongoose = require("mongoose")
require('dotenv').config()
mongoose.connect(process.env.Gaming)
const express = require("express")
const app = express()
const $ = require('jquery');
const session = require("express-session")

app.use(session({
    secret:'mysession',
    resave:false,
    saveUninitialized:false,
    cookie:{
        maxAge:500000000
    }
}))

// path
const path=require('path')
app.use(express.static(path.join(__dirname,'public')))

// for admin router
const adminRoute = require('./routes/adminRoute')
app.use('/admin', adminRoute);

// for user router
const userRoute = require("./routes/userRoute")
app.use('/',userRoute)

// server
app.listen(3000,function(){
    console.log("server is running")
})