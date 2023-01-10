const mongoose = require("mongoose");
const d1 = new Date();
const d = d1.toISOString().slice(0, 10);
const task = new mongoose.Schema({
    task_name:{
        type:String,
    },
    penalty:{
        type:String,
    },
    streak:{
        type:String,
    },
    proof:[{
        daily_proof:[{
            image:{
            type:String,
            },
            accepted:{
                type:String,
                default:"No",
            },
            uploader:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }}],
        date_time:{
            type:Date,
            default:d
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