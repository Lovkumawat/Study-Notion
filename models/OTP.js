const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");
const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
        require:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createAt:{
        type:Date,
        default:Date.now(),
        expires:5*60*1000,
    },
});

// a function->to send emails
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse=await mailSender(email,"verification Email from StudyNotion",otp);
        console.log("Email sends successfully",mailResponse);
    }
    catch(error){
        console.log("error occured while sending mails",error);
        throw error;
    }
}

OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
});


// write mailsender logic after schema and before model


module.exports=mongoose.model("OTP",OTPSchema);