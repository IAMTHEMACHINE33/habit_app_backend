const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

module.exports.userGuard=(req,res,next)=>{
    try {
        const token = req.headers.authorization.split(" ")[1];
        const data = jwt.verify(token, "token");
        User.findOne({_id:data.userId})
        .then((user_data)=>{
            req.user = user_data;
            next();
        })
        .catch((e)=>{
            res.json({success:false,msg:"Invalid token"})
        })
    } catch (e) {
        res.json({success:false,msg:e})
    }
}