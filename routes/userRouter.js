const express = require("express");
const router = new express.Router();
const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");


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
})

module.exports = router;