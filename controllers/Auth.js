const User=require("../models/User");
const OTP=require("../models/OTP");
const otpGenerator=require("otp-generator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const mailSender = require("../utils/mailSender")
require("dotenv").config();



// sendOTP
exports.sendOTP=async(req,res)=>{

    try{

     // fetch email from request body
    const {email}=req.body;

    // check if user is already exit
    const checkUserPresent=await User.findOne({email});

    // if user already exit,then return a response
    if(checkUserPresent){
        return res.status(401).json({
            success:false,
            message:'User already registered',
        })
 
    }
    // generate OTP
    // length of otp,and its conditions
    var otp=otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    });
    console.log("OTP generated",otp);

    // check unique OTP or not
    let result=await OTP.findOne({otp:otp});

    while(result){
        otp=otpGenerator(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,

        });
         result=await OTP.findOne({otp:otp});
    }

    const otpPayload={email,otp}

    // cerate an entry in db
    const otpBody=await OTP.create(otpPayload);
    console.log(otpBody);

    // return response successfully
    res.status(200).json({
        success:true,
        message:'OTP Send Successfully'
    })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }

}

// signUp

exports.signUp=async(req,res)=>{
    // data fetch from request body
   try{
    const{
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
    }=req.body;

    // validate data
    if(!firstName||!lastName||!email||!password||!confirmPassword||!otp){
            return res.status(403).json({
                success:false,
                message:"All fiels are required",
            })
        }
    

    // match password and confirm password
    if(password!=confirmPassword){
        return res.json({
            success:false,
            message:"Password and ConfirmPassword Value does not match,please try again"
        });
    }

    // check user already exist or not
    const exitingUser=await User.findOne({email});
    if(exitingUser){
        return res.status(400).json({
            success:false,
            message:"User is already registered",
        });
    } 

    // find most recent OTP for the user
    const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);
    console.log(recentOtp);



    // validate OTP
    if(recentOtp.length==0){
        //OTP not found
        return res.status(400).json({
            success:false,
            message:"OTP Found",
        });
    }else if(otp!==recentOtp.otp){
        // Invalid OTP
        return res.status(400).json({
            success:false,
            message:"Invalid OTP",
        });
    }
    
    
    // Hash password
    const hashedPassword=await bcrypt.hash(password,10);

    // entery cretate in DB
    const profiledetails=await Profile.create({
        gender:null,
        dateofBirth:null,
        contactNumber:null,
    });


    const user=await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionaldetails:profiledetails._id,
        image:`http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    });
    // return response
    return res.status(200).json({
        success:true,
        message:"User is registered successfully",
     });

   }catch(error){
    console.lof(error);
    return res.status(500).json({
        success:false,
        message:"User cannot be registered successfully please try again",
    })

   }

 



}


//Login

exports.login=async(req,res)=>{

    try{
        // get data from req body
        const {email,password}=req.body;

        // validation data
        if(!email||!password){
            return res.status(403).json({
                success:false,
                message:"All field are required,please try again",
            });
        }
        //user check exits or not
        const user=await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered ,please signup first",
            });
        }
        //generate JWT,after password matchinf
      

        if(await bcrypt.compare(password,user.password)){
            // password match
            const payload={
                email:user.email,
                id:user._id,
                role:user.role
            }

            let token=jwt.sign(payload,
                process.env.JWT_SECRET,
                {
                    expiresIn:"2h",
                }
              ); 
                // token added
                user=user.toObject();
                user.token=token;
                // remove password from user object
                // not in database 
                user.password=undefined;


                // create cookie and send response 
                
              // creating option
              const options={

                // expire date: from till now to 3 date 
                expire:new Date(Date.now()+3*24*60*60*1000),
                // client side pe isee ham access nhi kr payenge 
                httpOnly:true,
              }

              //  cookie:name,value,options 
              res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:'User is Logged in successfully ',
              });

                }else{
                    // password do not match
                    return res.status(401).json({
                        success:false,
                        message:"Password Incorrect",
                    });
    




                }
            }
            catch(error){
                console.log(error);
                return res.status(500).json({
                    success:false,
                    message:'Login Failure'
                });


            }
 }




// changePassword
// exports.changePassword=async(req,res)=>{

//     try{
//             // get data from req body
//     const userDetails= await User.findById(req.user.id)
//     // get olsPassword,newPassword,confirmPassword
//     const {oldPassword,newPassword}=req.body

//   // validate data
//   if(!(await bcrypt.compare(oldPassword,userDetails.password))){
//             // If old password does not match, return a 401 (Unauthorized) error
//     return res
//     .status(401)
//     .json({ success: false, message: "The password is incorrect" })
//   }

//   // encrypt password
//   const encryptedPassword=await bcrypt.hash(newPassword,10)
//    // update pwd in DB
//   const updatedPassword=await User.findByIdAndUpdate(req.user.id,{password:encryptedPassword},{new:true})
//   // send mail--Password updated





      
  











 
  
//   //return response

//     }catch(error){

//     }

// }


