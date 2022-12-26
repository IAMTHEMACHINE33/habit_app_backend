const express = require("express");
const router = new express.Router();
const Task = require("../models/taskModel");
const auth = require("../auth/auth");

router.post("/task/add",auth.userGuard,(req,res)=>{
    const task_name = req.body.task_name;
    const include_users = req.user.id;
    const data = new Task({
        task_name:task_name,
        include_users:[{
            account:include_users
        }]
    })
    data.save()
    .then(()=>{
        res.json({success:true,msg:"Task added"})
    })
    .catch((e)=>{
        res.json({success:false,error:e})
    })
})

router.get("/task/show",(req,res)=>{
    Task.find()
    .then((data)=>{
        res.json({success:true,data:data})
    })
    .catch((e)=>{
        res.json({success:false,error:e})
    })
})

router.post("/task/add_peer/:tid",auth.userGuard,async (req,res)=>{
    const peer = req.body.peer;
    const task = req.params.tid;
    let a;
    var b;
    try{
        a = await Task.findOne({_id:task})
    }
    catch{
        console.log("error")
    }
    if(a.include_users.length > 0){
        for(let i=0;i<a.include_users.length;i++){
            if(a.include_users[i].account == peer){
                b = "exist"
            }
            else{
                b = "no"
            }
        }
    }
    
    if(b == "no" || b == null){
        Task.findOneAndUpdate({_id:task},
            {
                $addToSet:{include_users:[
                    {account:peer}
                ]}
            })
        .then(()=>{
            res.json({success:true,msg:"Peers added"})
        })
        .catch((e)=>{
            res.json({succes:false,error:e})
        })
    }
    else{
        res.json({success:true,msg:"already added"})
    }
    
})

module.exports = router;
