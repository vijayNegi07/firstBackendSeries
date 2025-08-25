import mongoose from "mongoose";

const subSchema = new mongoose.Schema({
    subscribers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:0,
    }],


    channel:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }


},{timestamps:true});

export const Subscription = mongoose.model("Subscription", subSchema);