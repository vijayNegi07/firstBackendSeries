import {} from 'dotenv/config'
import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();

console.log(process.env.CORS_ORIGIN)

//app.use is used for middlewares and configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))

//limit the json request to prevent from server crash
app.use(express.json({limit:"20kb"}));

//allow the url parameter to be taken as input
//parses incoming requests with urlencoded payloads
app.use(express.urlencoded({extended:true, limit:"16kb"}));

//allow some static resources like image with specified folder
app.use(express.static("public"));

//allow us to manipulate the user cookie stored in the browser
app.use(cookieParser());

//route import
import userRouter from './routes/userRegister.js';

//route declaration
app.use("/api/v1/users",userRouter)

export{app};