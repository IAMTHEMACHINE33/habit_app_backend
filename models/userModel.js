const mongoose = require("mongoose");

const user = new mongoose.Schema({
    fullname:{
        type:String,
    },
    username:{
        type:String,
    },
    age:{
        type:String,
    },
    password:{
        type:String,
    },
    email:{
        type:String,
    }
});

module.exports=mongoose.model('User',user);