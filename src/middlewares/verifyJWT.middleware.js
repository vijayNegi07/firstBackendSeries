import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";


const verifyJWT = async(req, res, next) =>{
  try {
      //fetch refreshToken from cookies
      //check for valid token
      //decode the refreshTokwn and fetch the user.id from it
      //fetch the user from the database using the user.id
      //inject the user into the req
      //next
  
      const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", ""); 
  
      if(!accessToken){
          throw new ApiError(401, "Unauthorized Access ", false);
      }

      console.log(accessToken)
  
      const options = {
          httpOnly : true,
          secure:false
      }
      
      console.log( process.env.ACCESS_TOKEN_SECRET)

      const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, options, (error)=>{
        throw new ApiError(403, "Invalid Token", false  )
      });      
  
      const user = await User.findById(decodedToken._id).select(" -password -refreshToken");

      if(!user){
          throw new ApiError(403, "Invalid Access Token ", false);
      }
  
      req.user = user;
      next()

  } catch (error) {
    throw new ApiError(400,error.message, false)
  }
}

export {verifyJWT};