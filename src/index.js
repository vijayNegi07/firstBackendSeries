import dotenv from "dotenv";
// import {} from "dotenv/config", we can use dotenv module with this import statment
import { app } from "./app.js";
import dbConnect from './db/db_index.js';

dotenv.config({
    path: './.env',  //dont write ./env it should be ./.env
})

const port = process.env.PORT;
console.log(port);


dbConnect()
.then( 
    app.listen(port || 4000, ()=>{
        console.log("server is running on port ", port);
    })
)
.catch("error", (error)=>{
    console.log("Databse connection failed !! ", error)
})
