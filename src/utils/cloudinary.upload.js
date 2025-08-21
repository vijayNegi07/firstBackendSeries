import {} from "dotenv/config";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({ 
     cloud_name: process.env.CLOUDINARY_NAME, 
     api_key: process.env.CLOUDINARY_API, 
     api_secret: process.env.CLOUDINARY_SECRET // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async(localFilePath)=>{
    try {
        if(!localFilePath) return null;
    
        const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto",
    })
    } catch (error) {
        fs.unlinks(localFilePath);
        return null;
    }

}

export {uploadOnCloudinary};