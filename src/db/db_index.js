import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbConnect = async () => {
    try {
        console.log(process.env.MONGODB_URI); 
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("MongoDB connected Successfully ! ");
        
    } catch (error) {
        console.error("Error in connecting Database !! ", error);
        process.exit(1);
    }
}

export default dbConnect;