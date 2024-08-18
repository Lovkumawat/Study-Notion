const mongoose=require("mongoose");

const courseProgress=new mongoose.Schema({
    CourseID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    },
    conmpeltedVideos:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"SubSection",
        }
    ],

    });

module.exports=mongoose.model("CourseProgress",courseProgress);