import Router from "express"
import { verifyToken } from "../middleware/auth.middleware.js"
const router = Router()


// controllers
import { 
    registerUser,
    loginUser,
    logOut,
    checkUser    
} from "../controllers/auth.controller.js"

// routes
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyToken, logOut)
router.route("/check").get(verifyToken, checkUser)

export default router 