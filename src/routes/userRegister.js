import { Router } from "express";
import { registerUser } from "../contollers/user.contoroller.js";
import { upload } from "../middlewares/multer.middlware.js";

const router = Router();

router.route("/register").post(
    upload.fields(
        {   name:"avatar",
            maxCount:1 
        },
        {
           name:"coverImage",
            maxCount:1  
        }
    ),
    registerUser);

export default router;