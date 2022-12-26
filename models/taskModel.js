const mongoose = require("mongoose");

const task = new mongoose.Schema({
    task_name:{
        type:String,
    },
    proof:[{
        image:{
            type:String,
        }
    }],
    include_users:[{
        account:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
    }]

});
module.exports=mongoose.model("Task",task);