const express = require("express");
const router = new express.Router();
const Task = require("../models/taskModel");
const auth = require("../auth/auth");
const upload = require("../fileupload/fileupload")
const { ObjectId } = require("mongodb");


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
    // .populate({
    //     path: "include_users", 
    //     populate: {
    //        path: "account" 
    //     }//asd
    //  })
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
    }
    catch{
        console.log("error")
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

router.post("/task/:tid/proof",auth.userGuard, upload.single("proof_img"),async(req,res)=>{
    const task_id=req.params.tid;
    const image=req.file.filename;
    const uploader=req.user.id;
    var a;
    var include_validator ="no";
    var duplicate_validator="no";
    try{
        a = await Task.findOne({_id:task_id}) 
    }
    catch{
        console.log("error")
    }
    for(let b =0;b<a.include_users.length;b++){
        if(a.include_users[b].account == uploader){
            include_validator = "exists"
        }
    }
    for(let o =0;o<a.proof.length;o++){
        for(let c=0;c<a.proof[o].daily_proof.length;c++){
            if(a.proof[o].daily_proof[c].uploader == uploader){
                duplicate_validator="exists"
            }
        }
    }
    const d1 =new Date();
    const d = d1.toISOString().slice(0, 10);
    if(a.proof.length == 0 && include_validator == "exists"){
        Task.findOneAndUpdate({_id:task_id},
            {
                $addToSet:{
                    proof:[{
                        daily_proof:{
                            image:image,
                            uploader:uploader}
                    }]
                   } 
            })
            .then(()=>{
                res.json({success:true,msg:"proof uploaded"})
            })
            .catch((e)=>{
                res.json({success:false,error:e})
            })
    }
    else{ 
        for(let i =0;i<a.proof.length;i++){
            if((a.proof[i].date_time).toISOString().slice(0, 10) == d){
                if (include_validator == "exists" && duplicate_validator != "exists"){
                    Task.findOneAndUpdate({_id:task_id},
                        {
                            $addToSet: {
                              "proof.$[].daily_proof": {
                                $each: [{ image: image, uploader: uploader ,accepted:"yes"}]
                              }
                            }
                          },
                          {
                            arrayFilters: [
                              { "i": i }, 
                            ]
                          }
                        )
                        .then(()=>{
                            res.json({success:true,msg:"proof uploaded"})
                        })
                        .catch((e)=>{
                            res.json({success:true,error:e})
                        }) 
                }
                else{
                    res.json({success:true,msg:"exists"})
                }
                
            }
        }
       
    } 
    
    
    
    
})

router.put("/task/:tid/accept",auth.userGuard,async (req,res)=>{
    const user = req.user.id;
    const tid = req.params.tid;
    const day_id = req.body.day_id;
    var a;
    try{
        a = await Task.findOne({_id:tid})
    }
    catch{
        console.log("error")
    }
    if(a.proof.length != null){
        for(let i=0;i<a.proof.length;i++){
            
            var b = a.proof[i]._id
            var c = a.proof[i].daily_proof[0]._id
            console.log(b)
            console.log(c)
            if(a.include_users[i].account._id == user){
                
                Task.findOneAndUpdate({_id:tid},
                    {
                            $set: {
                              "proof.$[outerElement].daily_proof.$[innerElement].accepted": "Yes" 
                            }     
                    },
                    {
                        arrayFilters: [
                          { "outerElement.id": b}, 
                          { "innerElement.id": c} 
                        ]
                      })
                        .then(()=>{
                            res.json({success:true,msg:"Proof accepted"})
                        })
                        .catch((e)=>{
                            res.json({succes:false,error:e})
                        })
            }
        }
    }
    
    // console.log(a.proof[0])
    // res.json({msg:"asd"})
    // Task.findOneAndUpdate({proof:{$elemMatch:{_id:day}}},
    //     {
    //         $addToSet:{proof:{
    //             daily_proof:{
    //                 accepted:"Yes"
    //                },
    //         }}
    //     })
    //     .then(()=>{
    //         res.json({success:true,msg:"Proof accepted"})
    //     })
    //     .catch((e)=>{
    //         res.json({succes:false,error:e})
    //     })
})


module.exports = router;
