const express = require("express");
const router = new express.Router();
const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../auth/auth");
const upload = require("../fileupload/fileupload");


router.post("/user/register",(req,res)=>{
    const email =req.body.email;
    const username = req.body.username;
    User.findOne({$or:[{email:email},{username:username}]})
    .then((data)=>{
        // console.log(data.username)
        if(data!=null){
                res.json({success:true,msg:"Email or username already exists"});
                return;
        }
        const fullname = req.body.fullname;
        const username = req.body.username;
        const age = req.body.age;
        const password = req.body.password;
        const email = req.body.email;

        bcryptjs.hash(password,10,(e,hashed_pw)=>{
            const data = new User({
                fullname:fullname,
                username:username,
                age:age,
                password:hashed_pw,
                email:email,
            })
            data.save()
            .then(()=>{
                res.json({success:true,msg:"User Added"})
            })
            .catch((e)=>{
                res.json({success:false,error:e})
            })
        })
        
    })
    .catch()
})

router.post("/user/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;

    User.findOne({username:username})
    .then((data)=>{
        if(data == null){
            res.json({success:false, error:"Invalid Credential"})
            return;
        }
        bcryptjs.compare(password,data.password,(e,result)=>{
            if(result == false){
                res.json({success:false,error:"Invalid Credentials"})
                return;
            }
        const token = jwt.sign({userId:data._id},"token",{expiresIn:"1d"});
            res.json({success:true,token:token})
        })
    })
    .catch()
})

router.get("/user/show",(req,res)=>{
    User.find()
    // .populate({
    //     path: "friends", 
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
router.post("/user/profile_pic",auth.userGuard,upload.single("profile_pic"),(req,res)=>{
    const profile_pic = req.file.filename;
    const user = req.user.id;
    User.findOneAndUpdate({_id:user},
        {
            profile_pic:profile_pic
        })
        .then(()=>{
            res.json({success:true,msg:"profile pic uploaded"})
        })
        .catch((e)=>{
            res.json({success:false,error:e})
        })

})

router.get("/user/friends_list",auth.userGuard,(req,res)=>{
    const user = req.user.id;
    
    User.findOne({_id:user})
    .then((data)=>{
        res.json({success:true,data:data.friends})
    })
    .catch((e)=>{
        res.json({success:false,error:e})
    })
})

router.get("/user/friend/:fid",auth.userGuard,(req,res)=>{
    const user = req.user.id;
    const fr_id = req.params.fid;
    console.log(user);
    console.log(fr_id);
    User.findOne({_id:user})
    .then((data)=>{
        // console.log(data)
        for(f in data.friends){
            console.log(data.friends[f].account)
            if(data.friends[f].account == fr_id){
                User.findOne({_id:fr_id})
                .then((data2)=>{
                    res.json({success:true,data:data2})
                })
                .catch((e)=>{
                    res.json({success:false,error:e})
                })
            }
        }
    })
    .catch((e)=>{
        res.json({success:false,error:e})
    })
})

router.post("/user/friend/:uid/request",auth.userGuard,async(req,res)=>{
    const friends_id=req.params.uid;
    const user=req.user.id;
    const status ="pending";
    let a;
    var b;
    let c;
    var d;

    try{
        a = await User.findOne({_id:friends_id})
        c = await User.findOne({_id:user})
    }
    catch{
        console.log("error")
    }
    if(a.friends.length > 0){
        for(let i=0;i<a.friends.length;i++){
            if(a.friends[i].account==user){
                b = "exist"
            }
            else{
                b="no"
            }
        }
    }
    
    if(c.friends.length > 0){
        for(let i=0;i<c.friends.length;i++){
            if(c.friends[i].account==friends_id){
                d = "exist"
            }
            else{
                d="no"
            }
        }
    }
    
    if(b == "no" || b == null ){
        if(d =="no" || d == null){
            User.findOneAndUpdate({_id:friends_id},
                {
                    $addToSet:{
                        friends:[{
                            account:user,
                            status:status
                        }]
                    }
                })
            .then(()=>{
                res.json({success:true,msg:"request sent"})
            })
            .catch((e)=>{
                res.json({success:false,error:e})
            })
        }
        else{
            res.json({success:true,msg:"pending request"})
        }
    }
    else{
        res.json({success:true,msg:"already sent"})
    }
    
})

router.post("/user/friend/accept/:aid",auth.userGuard,(req,res)=>{
    const user = req.user.id;
    const accept_user = req.params.aid;
    const status = "connected";
    User.findOneAndUpdate({_id:accept_user},
        {
            $addToSet:{
                friends:[{
                    account:user,
                    status:status
                }]
            }
        })
        .then()
        .catch()
    User.findOneAndUpdate({_id:user},
        {
            friends:[{
                account:accept_user,
                status:status
            }]
        })
        .then(()=>{
            res.json({success:true,msg:"accepted"})
        })
        .catch((e)=>{
            res.json({success:false,error:e})
        })
})




module.exports = router;