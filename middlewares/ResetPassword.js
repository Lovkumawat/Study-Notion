
const User=require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt=require("bcrypt");
// resetPasswordToken
exports.resetPasswordToken=async(res,req)=>{
 try{
       // get email from req body
       const email=req.body.email;
       const user=await User.findOne({email:email});
        // check user for ths email,email validation
       if(!user){
           return res.json({success:false,
               message:'Your Email is not registered with us '
           });
       }
   
       // generate token
       const token=crypto.randomUUID();
       console.log(token);
       //update user by adding token and expiretion time 
       const updatedDetails=await User.findOneAndUpdate(
           {email:email},
           {
            // token is used to fetch the user entry in resetpassword
               token:token,
               resetPasswordExpires:Date.now()+5*60*1000,
           },
           // new:update docoment return in response 
           {new:true}
       );
       // create url
       // token is used to generate different links
       const url=`http://localhost:3000/update-password/${token}`
        // send mail containing the url
        await mailSender(email,"Password Reset Link",`Password reset Link:${url}`)
   
       // return response
       return res.json({
           success:true,
           message:'Email sent successfully please check email and password',
       })
 }
 catch(error){
    console.log(500).json({
        success:false,
        message:'Something went wrong while sending reset password mail'
    })

 }

    
}







// resetPassword

exports.resetPassword=async(req,res)=>{
  try{
      // fetch data
    // forntend fetch password ,confirmPassword and feth token from url {token}
    const {password,confirmPassword,token}=req.body;
    //validation
    if(password!=confirmPassword){
        return res.json({
            success:false,
            message:'Password does not match,please try again!!'
        })
    }

    // get userDetails from db using token
    const userDetails=await User.findOne({token:token});
    // if no entry - invalid token
    if(!userDetails){
        return res.json({
            success:false,
            message:'Token is invalid',
        });
    }

   // token time check
   if(userDetails.resetPasswordExpires<Date.now()){
    return res.json({
        success:false,
        message:'Token is expired,please regenerate your token'
    });


   }



  
    // hash password 
    const hashedPassword=awaitbcrypt.hash(password,10);


    //update password
    await User.findOneAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true},

    );
    // return response
    return res.status(200).json({
        success:true,
        message:'Password reset successful',
    });
  }
  catch(error){
    return res.status(500).json({
        success:false,
        message:'Something went wrong while sounding reset password mail'
    })
  }





}