import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { upload } from "../middlewares/multer.middlware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.upload.js";
import User from "../models/user.model.js"

const registerUser = asyncHandler(async(req,res)=>{
    //extract information form req
    const {email, username, password, fullName} = req.body;

    //validate the fields extracted
    //to reduce multiple if else statements we can use some method
    //it return true if any of the field is empty
     if ([email,username,password,fullName].some((field) => field?.trim === "")) {
        throw new ApiError(400, "All fields are required", false);
    }

    //check if the user exist already in the db
    const userExists = await User.findOne({
        $or: [{username},{email}]
    })

    //if it exists then send an error message
    if (userExists) {
        throw new ApiError(409, "User already exits",false);
    }

    //obtain localpath from the multer
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverLocalPath = req.files?.coverImage[0]?.path;

     if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required ", false);
    }

    //upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);
    
    //validate the cloudinary return object
    if (!avatar) {
        throw new ApiError(500, "Image uploading failure ", false);
    }

  
    //create a user and extract required fields
    const newUser = await User.create({
        fullName,
        avatar:avatar?.url ,
        coverImage:coverImage?.url || "",
        username:username?.toLowercase(),
        email,
        password,
    })
    
    //check if the user created
    const userCreated = await User.findById(newUser._id).select(
        " -password -refreshToken"
    );

    if (!userCreated) {
        throw new ApiError(500,"Something went wrong while creating the user ", false);
    }

    //after successfull user creation send response using the response api
    return res.status(200).json(
        new ApiResponse("User created Successfully ", 200, userCreated)
    )
    
})

export {registerUser};