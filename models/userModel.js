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
    },
    friends:[{
        account:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        },
        status:{
            type:String
        }
    }]
});

module.exports=mongoose.model('User',user);