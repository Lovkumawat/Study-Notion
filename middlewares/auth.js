const jwt = reqiure("jsonwebtoken");
require("dotenv").config();

const User=require("../models/User");

//
exports.auth=async(req,res,next)=>{
    try{
        // extract token
        const token=req.cookies.token||req.body.token||req.header("Authorisation").replace("Bearer ","");

        // if token missing , then  return response 
        if(!token){
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            });
        }

        // verify the token
        try{
            const decode = await jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user=decode;
        }
        catch(err){
            return res.status(401).json({
                sucess:false,
                message:'token is invalid',
            });
        }
        next();
    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validation the token',
        });
    }
}

// isStudent

exports.isStudent=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Student"){
            return res.status(401).json({
                success:false,
                message:'This is a protected route for student only',
            });
        }
        next();
    } 
    catch(error){
        // 500: internal server error
        return res.status(500).json({
            success:false,
            message:'User role is not matching ',
        });
    }
    }
// isInstructor
    exports.isInsructor=async(req,res,next){
        try{
            if(req.user.accountType!=="Instructor"){
                return res.status(401).json({
                    success:false,
                    message:'This is a protected route forI nstructor only',
                });
            }
            next();
        } 
        catch(error){
            // 500: internal server error
            return res.status(500).json({
                success:false,
                message:'User role is not matching ',
            });
        }
        }

// isAdmin

exports.isAdmin=async(req,res,next)=>{
    try{
        if(req.user.accountType!=="Admin"){
            return res.status(401).json({
                success:false,
                message:'This is a protected route for Admin only',
            });
        }
        next();
    } 
    catch(error){
        // 500: internal server error
        return res.status(500).json({
            success:false,
            message:'User role is not matching ',
        });
    }

    }
    


