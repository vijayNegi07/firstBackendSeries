import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../contollers/user.contoroller.js";
import { upload } from "../middlewares/multer.middlware.js";
import { verifyJWT } from "../middlewares/verifyJWT.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {   name:"avatar",
            maxCount:1 
        },
        {
           name:"coverImage",
            maxCount:1  
        }
    ]),
    registerUser);

router.post("/login" ,loginUser);


//protect routes
router.route("/logout").post(verifyJWT ,logoutUser);

export default router;