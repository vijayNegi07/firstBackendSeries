import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { upload } from "../middlewares/multer.middlware.js";
import { uploadOnCloudinary } from "../utils/cloudinary.upload.js";
import {User} from "../models/user.model.js"
import jwt from "jsonwebtoken";

const generateAccessNrefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false}, user);

    return {refreshToken, accessToken};
    } catch (error) {
        throw new ApiError(500, "Something went wrong while aunthenticating user. ", false);
    }

}

const registerUser = asyncHandler(async(req,res)=>{
    //extract information form req
    console.log("Whole content of req ", req.body);
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
    console.log("req.files content ",req.files)
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
        username:username?.toLowerCase(),
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

const loginUser = asyncHandler(async(req,res)=>{
    //check for refresh token if not expired then generate access token and authenticate user otherwise
    //user credentials fetch
    console.log("login in process")

    const {email, password,username} = req.body;
    console.log(email, username);
    

    //check for empty values
    if(!username || !email){
        throw new ApiError(400, "Usename and email both are required. ", false);
    }
    //check for the user in database
    const userExists =  await User.findOne({
        $or : [{ username },{ email }]
    })



    if(!userExists){
        throw new ApiError(404, "Users does not exits. ", false)
    }

    console.log("User exists, ", userExists);
    

    //if present then check the password entered by the user
    //the isPasswordCorrect is belongs to userExists(instance) not mongoose
    //therefore we have not wrote User.isPasswordCorrect()
    const passwordValid = userExists.isPassCorrect(password);

    if(!passwordValid){
        throw new ApiError(400, "Password is incorrect. ", false);
    }

    //if the password is correct then create session 
    const {accessToken, refreshToken} = await generateAccessNrefreshToken(userExists._id);

    console.log(accessToken, refreshToken);

    const user = await User.findById(userExists._id);



    console.log("update User ", user);
    
    
    const options= {
        httpOnly:true,
        secure:false,
    }

    return res.status(200).cookie("refreshToken", refreshToken,options).cookie("accessToken", accessToken, options)
    .json(new ApiResponse("SuccessFull login", 200, user))
})

const logoutUser = asyncHandler(async(req,res)=>{
    //fetch the user id from the req.user
    //update the user and remove refresh token
    //clear cookies and return response

    const updatedUser = User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined,
            }
        },
        {
            new:true,
        }
    )

    const options= {
        httpOnly:true,
        secure:true,
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse("User logged Out successfully. ", 200))

});

const generateRefreshToken = asyncHandler(async()=>{
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Accesse");
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id);

    if(!user){
        throw new ApiError(409, "Invalid refresh Token ");
    }

    if (incomingRefreshToken !== user.refreshToken) {
        throw new ApiError(409, "Token expired");
        
    }

    const {refreshToken, accessToken} = generateAccessNrefreshToken(user._id);

    options = {
        httpOnly:true,
        secure:false,
    }

    return res.status(200).cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options)
    .json(new ApiResponse("Tokens regenerated ", 200, {}))


});

export {registerUser, loginUser, logoutUser};