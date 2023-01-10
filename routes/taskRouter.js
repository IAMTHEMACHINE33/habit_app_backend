const express = require("express");
const router = new express.Router();
const Task = require("../models/taskModel");
const auth = require("../auth/auth");
const upload = require("../fileupload/fileupload")
const { ObjectId } = require("mongodb");


router.post("/task/add",auth.userGuard,(req,res)=>{
    const task_name = req.body.task_name;
    const penalty = req.body.penalty;
    const include_users = req.user.id;
    const data = new Task({
        task_name:task_name,
        penalty:penalty,
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

router.post("/task/:tid/proof",auth.userGuard, upload.single("proof_img"),async(req,res)=>{
    const task_id=req.params.tid;
    const image=req.file.filename;
    const uploader=req.user.id;
    var a;
    var include_validator ="no";
    var duplicate_validator="no";
    var date_validator="no";
    var date_same_validator;
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
    // for(let o =0;o<a.proof.length;o++){
    //     for(let c=0;c<a.proof[o].daily_proof.length;c++){
    //         if(a.proof[o].daily_proof[c].uploader == uploader){
    //             duplicate_validator="exists"
    //         }
    //     }
    // }
    if(a.proof.length >0){
        for(let c=0;c<a.proof[a.proof.length-1].daily_proof.length;c++){
            if(a.proof[a.proof.length-1].daily_proof[c].uploader == uploader){
                duplicate_validator="exists"
            }
        }
    }
    
    
    
    
    const d1 =new Date();
    const d = d1.toISOString().slice(0, 10);
    // console.log(d)
    for(let o = 0;o<a.proof.length;o++){
        // console.log(a.proof[o].date_time.toISOString().slice(0, 10) )
        if(a.proof[o].date_time.toISOString().slice(0, 10) == d){
            date_same_validator=a.proof[o]._id
            // console.log(date_same_validator)
        }
    }

    for(let o =0;o<a.proof.length;o++){
        // console.log(a.proof[o].date_time.toISOString().slice(0, 10))
        if(a.proof[o].date_time.toISOString().slice(0, 10) == d){
            date_validator="exists"
        }
    }
    
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
    else if(date_validator != "exists" && include_validator == "exists"){
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
        if(include_validator == "exists" && duplicate_validator != "exists" && date_same_validator!=null){
            Task.findOneAndUpdate({_id:task_id},
                {
                    $addToSet: {
                      "proof.$[dae].daily_proof": {
                        $each: [{ image: image, uploader: uploader }]
                      }
                    }
                  },
                  {
                    arrayFilters: [
                      { "dae._id": date_same_validator }, 
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
        
        
        
        // for(let i =0;i<a.proof.length;i++){
        //     if((a.proof[i].date_time).toISOString().slice(0, 10) == d){
        //         if (include_validator == "exists" && duplicate_validator != "exists"){
        //             Task.findOneAndUpdate({_id:task_id},
        //                 {
        //                     $addToSet: {
        //                       "proof.$[].daily_proof": {
        //                         $each: [{ image: image, uploader: uploader }]
        //                       }
        //                     }
        //                   },
        //                   {
        //                     arrayFilters: [
        //                       { "i": i }, 
        //                     ]
        //                   }
        //                 )
        //                 .then(()=>{
        //                     res.json({success:true,msg:"proof uploaded"})
        //                 })
        //                 .catch((e)=>{
        //                     res.json({success:true,error:e})
        //                 }) 
        //         }
        //         else{
        //             res.json({success:true,msg:"exists"})
        //         }
                
        //     }
        // }
       
    } 
    
    
    
    
})

router.put("/task/:tid/accept",auth.userGuard,async (req,res)=>{
    const task_id=req.params.tid;
    const uploader=req.user.id;
    var a;
    var include_validator ="no";
    var duplicate_validator="no";
    var inside;
    var outside;
    var streak = 0;

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
    for(let i =0;i<a.proof.length;i++){
        for(let j = 0;j<a.proof[i].daily_proof.length;j++){
            if(a.proof[i].daily_proof[j].uploader != uploader){
                inside= a.proof[i].daily_proof[j]._id
                outside=i;
            }
        }
    }
    if(inside != null && outside != null && include_validator == "exists"){
        Task.findOneAndUpdate({_id:task_id},
            {
                $set: {
                  "proof.$[].daily_proof.$[inside].accepted": "Yes"
                }
              },
              {
                arrayFilters: [
                  { "inside._id": inside }, 
                ]
              }
            )
            .then(()=>{
                Task.findOne({_id:task_id})
                .then((data)=>{
                    var accepted=0;
                    var final=0;
                    var final1=0;
                    const d1 =new Date();
                    const today = d1.toISOString().slice(0, 10);
                    var validator1 = "no";
                    var validator2 = "no";

                for(let n=data.proof.length;n>0;n--){
                    // console.log(data.proof[n-1])
                    if(data.proof[n-1].date_time.toISOString().slice(0, 10) != today){
                        for(let m =0;m<data.proof[n-1].daily_proof.length;m++){   
                            if(data.proof[n-1].daily_proof[m].accepted == "Yes"){
                                accepted=accepted+1
                            }
                        }
                    }
                    else{
                        validator1="today"
                    }
                    if(n-1>0){
                        // console.log(n-1)
                        // console.log(n-2)
                        // console.log(data.proof[n-1].date_time - data.proof[n-2].date_time)
                        if(data.proof[n-1].date_time.toISOString().slice(0, 10) != today){
                            if(data.proof[n-1].date_time - data.proof[n-2].date_time == 86400000){
                                final1=final1+1;
                            }
                        }
                        else{
                            validator2="today"
                        }
                    }
                    // console.log(accepted)
                    if(accepted==2){
                        final=final+1;
                    }
                    else{
                        accepted=0;
                        break;
                    }
                    accepted=0;
                }
                // console.log(final+"asdasd")
                // console.log(final1+"asdasd")
                if(final<final1 && validator1!="today" && validator2!="today"){
                    console.log(final)
                    Task.findOneAndUpdate({_id:task_id},
                        {
                            streak:final
                        })
                        .then()
                        .catch()
                }
                else if(final1<=final && validator1!="today" && validator2!="today"){
                    // console.log(final1)
                    Task.findOneAndUpdate({_id:task_id},    
                        {
                            streak:final1
                        })
                        .then()
                        .catch()
                }

                })
                .catch()
                
                res.json({success:true,msg:"proof accepted"})
            })
            .catch((e)=>{
                res.json({success:true,error:e})
            }) 
    }
    

})



module.exports = router;
