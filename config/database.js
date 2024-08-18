const mongoose=require("mongoose");
require("dotenv").config();
exports.connect=()=>{
    mongoose.connect(process.env.MONGO_URL,{
        userNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>console.log("DB Connected Successfully"))
    .catch((error)=>{
        console.log("DB Connected Faild")
        console.error(error);
        process.exit(1);
    })
};