import mongoose, {Schema, Model, model} from "mongoose";
import bcrypt from "bcrypt";
import {jsonwebtoken as jwt}from "jsonwebtoken";

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        trim:true,
    },
    password:{
        type:String,
        required:[true, "Password is required"],
        lowercase:true,
        unique:true
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    avatar:{
        type:String,
        required:true
    },
    coverImage:{
        type:String,
    },
},{timestamps:true});


//.pre is used to create a middlware
//this just encrypt the password before saving it in the database
userSchema.pre("save", async function(next){
    //if the password is not modified then no need to encrypt the password again 
    //calling next() to avoid the encryption
    if (!this.isModified("password")) next();

    //if the password is modified then new password should be encypted
    this.password = await bcrypt.hash(this.password, 10);
    next();
})


//schema.methods gives us the power to create our own method that can access the variables inside the schema
//compares the user entered password and the encrypted one in the database
userSchema.methods.isPassCorrect = async function(){
    return await bcrypt.compare("passwrod", this.password);
}

userSchema.methods.generateAccessToken = function () {
    jwt.sign({})
}


export const User = model("User", userSchema);
